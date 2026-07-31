import { z } from "zod";
import { client } from "../client.js";
import crypto from "node:crypto";

export const loginSchema = z.object({
  email: z.string().email().describe("104.com.tw account email"),
  password: z.string().describe("Account password"),
});

export const logoutSchema = z.object({});

interface OidcConfig {
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint?: string;
  revocation_endpoint?: string;
  scopes_supported?: string[];
}

interface TokenResponse {
  access_token: string;
  id_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
}

interface UserInfo {
  sub: string;
  email?: string;
  name?: string;
}

function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString("base64url");
}

function generateCodeChallenge(verifier: string): string {
  return crypto.createHash("sha256").update(verifier).digest("base64url");
}

const OIDC_DISCOVERY_URL = "https://oidc.104.com.tw/.well-known/openid-configuration";
const OIDC_CLIENT_ID = "my104";
const OIDC_REDIRECT_URI = "https://login.104.com.tw/callback";
const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

async function getOidcConfig(): Promise<OidcConfig> {
  const res = await client.request(OIDC_DISCOVERY_URL, { method: "GET" });
  if (!res.ok) throw new Error(`OIDC discovery failed: ${res.status}`);
  const config = (await res.json()) as OidcConfig;
  if (!config.authorization_endpoint || !config.token_endpoint) {
    throw new Error("OIDC discovery response is missing required endpoints.");
  }
  return config;
}

function getScopes(config: OidcConfig): string {
  const supported = new Set(config.scopes_supported ?? []);
  if (supported.size > 0 && !supported.has("openid")) {
    throw new Error("OIDC discovery does not advertise the required openid scope.");
  }
  // Discovery advertises offline_access globally, but 104's public `my104`
  // client currently rejects it, as well as profile and email. Preserve a
  // refresh token if one is returned, but do not request an invalid scope.
  return "openid";
}

function hasMatchingState(received: string | null, expected: string): boolean {
  if (!received) return false;
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  return (
    receivedBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
  );
}

function storeTokens(tokens: TokenResponse): void {
  client.setTokens({
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresIn: tokens.expires_in,
  });
}

export async function ensureAuthenticated(): Promise<boolean> {
  if (!client.isLoggedIn()) return false;
  if (!client.isAccessTokenExpired()) return true;

  const refreshToken = client.getRefreshToken();
  if (!refreshToken) {
    await client.clearSession();
    return false;
  }

  try {
    const config = await getOidcConfig();
    const res = await client.rawRequest(config.token_endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: OIDC_CLIENT_ID,
      }).toString(),
    });
    if (!res.ok) throw new Error(`Token refresh failed: ${res.status}`);

    const tokens = (await res.json()) as TokenResponse;
    storeTokens({ ...tokens, refresh_token: tokens.refresh_token ?? refreshToken });
    return true;
  } catch {
    await client.clearSession();
    return false;
  }
}

export async function login(
  params: z.infer<typeof loginSchema>
): Promise<string> {
  if (client.isLoggedIn()) {
    return "Already logged in. Use logout first to switch accounts.";
  }

  try {
    const config = await getOidcConfig();
    const verifier = generateCodeVerifier();
    const challenge = generateCodeChallenge(verifier);
    const state = crypto.randomBytes(16).toString("hex");

    // Step 1: Get login challenge from 104's auth flow
    const authParams = new URLSearchParams({
      response_type: "code",
      client_id: OIDC_CLIENT_ID,
      redirect_uri: OIDC_REDIRECT_URI,
      scope: getScopes(config),
      code_challenge: challenge,
      code_challenge_method: "S256",
      state,
    });

    const authRes = await client.request(
      `${config.authorization_endpoint}?${authParams}`,
      {
        method: "GET",
        redirect: "manual",
        headers: {
          "User-Agent": BROWSER_USER_AGENT,
        },
      }
    );

    // Extract login_challenge from redirect location
    const location = authRes.headers.get("location") ?? "";
    const loginChallenge = new URL(
      location,
      "https://oidc.104.com.tw"
    ).searchParams.get("login_challenge");

    if (!loginChallenge) {
      return "Failed to initiate auth flow. The site may have changed its login process.";
    }

    // Step 2: Submit credentials to signin API
    const signinRes = await client.request(
      `https://api.signin.104.com.tw/oidc/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Referer: "https://signin.104.com.tw/",
          "User-Agent": BROWSER_USER_AGENT,
        },
        body: JSON.stringify({
          email: params.email,
          password: params.password,
          loginChallenge,
        }),
        redirect: "manual",
      }
    );

    if (!signinRes.ok && signinRes.status !== 302) {
      const body = await signinRes.text().catch(() => "");
      if (body.includes("密碼") || body.includes("password")) {
        return "Login failed: Invalid email or password.";
      }
      return `Login failed: ${signinRes.status} - ${body.slice(0, 200)}`;
    }

    // Step 3: Follow redirect chain to get auth code
    const signinData = await signinRes.json().catch(() => null) as { redirect_to?: string } | null;
    const redirectTo =
      signinData?.redirect_to ?? signinRes.headers.get("location");

    if (!redirectTo) {
      return "Login failed: No redirect after credential submission.";
    }

    // Follow the redirect to get the code
    const codeRes = await client.request(redirectTo, {
      redirect: "manual",
      headers: {
        "User-Agent": BROWSER_USER_AGENT,
      },
    });

    const callbackLocation = codeRes.headers.get("location") ?? "";
    const callbackUrl = new URL(callbackLocation, "https://login.104.com.tw");
    const code = callbackUrl.searchParams.get("code");
    if (!hasMatchingState(callbackUrl.searchParams.get("state"), state)) {
      return "Login failed: OAuth state validation failed.";
    }
    const oauthError = callbackUrl.searchParams.get("error");
    if (oauthError) {
      const description = callbackUrl.searchParams.get("error_description");
      throw new Error(
        `OAuth authorization failed: ${oauthError}${description ? ` (${description})` : ""}`
      );
    }

    if (!code) {
      return "Login failed: Could not extract authorization code.";
    }

    // Step 4: Exchange code for tokens
    const tokenRes = await client.rawRequest(config.token_endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: OIDC_REDIRECT_URI,
        client_id: OIDC_CLIENT_ID,
        code_verifier: verifier,
      }).toString(),
    });

    if (!tokenRes.ok) {
      return `Token exchange failed: ${tokenRes.status}`;
    }

    const tokens = (await tokenRes.json()) as TokenResponse;
    storeTokens(tokens);

    // Step 5: Get user info
    const userRes = config.userinfo_endpoint
      ? await client.request(config.userinfo_endpoint, {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        })
      : undefined;

    if (userRes?.ok) {
      const userInfo = (await userRes.json()) as UserInfo;
      return `Logged in successfully as ${userInfo.email ?? userInfo.sub}`;
    }

    return "Logged in successfully.";
  } catch (err) {
    return `Login error: ${err instanceof Error ? err.message : String(err)}`;
  }
}

export async function logout(
  _params: z.infer<typeof logoutSchema>
): Promise<string> {
  if (!client.isLoggedIn()) {
    return "Not currently logged in.";
  }
  // Clear token by creating a new client state — access token is cleared
  const accessToken = client.getAccessToken();
  const refreshToken = client.getRefreshToken();

  try {
    const config = await getOidcConfig();
    if (config.revocation_endpoint) {
      for (const token of [refreshToken, accessToken]) {
        if (!token) continue;
        await client.rawRequest(config.revocation_endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ token, client_id: OIDC_CLIENT_ID }).toString(),
        });
      }
    }
  } catch {
    // Local logout must still succeed when the revocation endpoint is unavailable.
  } finally {
    await client.clearSession();
  }
  return "Logged out successfully.";
}
