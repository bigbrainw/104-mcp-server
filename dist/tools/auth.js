import { z } from "zod";
import { client } from "../client.js";
import crypto from "node:crypto";
export const loginSchema = z.object({
    email: z.string().email().describe("104.com.tw account email"),
    password: z.string().describe("Account password"),
});
export const logoutSchema = z.object({});
function generateCodeVerifier() {
    return crypto.randomBytes(32).toString("base64url");
}
function generateCodeChallenge(verifier) {
    return crypto.createHash("sha256").update(verifier).digest("base64url");
}
async function getOidcConfig() {
    const res = await fetch("https://oidc.104.com.tw/.well-known/openid-configuration");
    return res.json();
}
export async function login(params) {
    if (client.isLoggedIn()) {
        return "Already logged in. Use logout first to switch accounts.";
    }
    try {
        const verifier = generateCodeVerifier();
        const challenge = generateCodeChallenge(verifier);
        const state = crypto.randomBytes(16).toString("hex");
        // Step 1: Get login challenge from 104's auth flow
        const authParams = new URLSearchParams({
            response_type: "code",
            client_id: "my104",
            redirect_uri: "https://login.104.com.tw/callback",
            scope: "openid profile email",
            code_challenge: challenge,
            code_challenge_method: "S256",
            state,
        });
        const authRes = await fetch(`https://oidc.104.com.tw/oauth2/auth?${authParams}`, {
            method: "GET",
            redirect: "manual",
            headers: {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            },
        });
        // Extract login_challenge from redirect location
        const location = authRes.headers.get("location") ?? "";
        const loginChallenge = new URL(location, "https://oidc.104.com.tw").searchParams.get("login_challenge");
        if (!loginChallenge) {
            return "Failed to initiate auth flow. The site may have changed its login process.";
        }
        // Step 2: Submit credentials to signin API
        const signinRes = await fetch(`https://api.signin.104.com.tw/oidc/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Referer: "https://signin.104.com.tw/",
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            },
            body: JSON.stringify({
                email: params.email,
                password: params.password,
                loginChallenge,
            }),
            redirect: "manual",
        });
        if (!signinRes.ok && signinRes.status !== 302) {
            const body = await signinRes.text().catch(() => "");
            if (body.includes("密碼") || body.includes("password")) {
                return "Login failed: Invalid email or password.";
            }
            return `Login failed: ${signinRes.status} - ${body.slice(0, 200)}`;
        }
        // Step 3: Follow redirect chain to get auth code
        const signinData = await signinRes.json().catch(() => null);
        const redirectTo = signinData?.redirect_to ?? signinRes.headers.get("location");
        if (!redirectTo) {
            return "Login failed: No redirect after credential submission.";
        }
        // Follow the redirect to get the code
        const codeRes = await fetch(redirectTo, {
            redirect: "manual",
            headers: {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            },
        });
        const callbackLocation = codeRes.headers.get("location") ?? "";
        const callbackUrl = new URL(callbackLocation, "https://login.104.com.tw");
        const code = callbackUrl.searchParams.get("code");
        if (!code) {
            return "Login failed: Could not extract authorization code.";
        }
        // Step 4: Exchange code for tokens
        const tokenRes = await fetch("https://oidc.104.com.tw/oauth2/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code,
                redirect_uri: "https://login.104.com.tw/callback",
                client_id: "my104",
                code_verifier: verifier,
            }).toString(),
        });
        if (!tokenRes.ok) {
            return `Token exchange failed: ${tokenRes.status}`;
        }
        const tokens = (await tokenRes.json());
        client.setAccessToken(tokens.access_token);
        // Step 5: Get user info
        const userRes = await fetch("https://oidc.104.com.tw/userinfo", {
            headers: {
                Authorization: `Bearer ${tokens.access_token}`,
            },
        });
        if (userRes.ok) {
            const userInfo = (await userRes.json());
            return `Logged in successfully as ${userInfo.email ?? userInfo.sub}`;
        }
        return "Logged in successfully.";
    }
    catch (err) {
        return `Login error: ${err instanceof Error ? err.message : String(err)}`;
    }
}
export async function logout(_params) {
    if (!client.isLoggedIn()) {
        return "Not currently logged in.";
    }
    // Clear token by creating a new client state — access token is cleared
    client.setAccessToken("");
    return "Logged out successfully.";
}
//# sourceMappingURL=auth.js.map