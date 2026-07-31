import { CookieJar } from "tough-cookie";

const BASE_HEADERS = {
  "User-Agent": "104-mcp-client/1.0 (https://github.com/bigbrainw/104-mcp-server)",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
};

export class Client104 {
  private cookieJar: CookieJar;
  private accessToken?: string;
  private refreshToken?: string;
  private accessTokenExpiresAt?: number;

  constructor() {
    this.cookieJar = new CookieJar();
  }

  private async getCookieHeader(url: string): Promise<string> {
    return this.cookieJar.getCookieString(url);
  }

  private async setCookiesFromResponse(
    url: string,
    setCookieHeaders: string[]
  ): Promise<void> {
    for (const cookie of setCookieHeaders) {
      await this.cookieJar.setCookie(cookie, url);
    }
  }

  async rawRequest(
    url: string,
    options: {
      method?: string;
      body?: BodyInit;
      referer?: string;
      headers?: Record<string, string>;
      redirect?: RequestRedirect;
    }
  ): Promise<Response> {
    const cookieHeader = await this.getCookieHeader(url);
    const headers: Record<string, string> = {
      ...BASE_HEADERS,
      ...(options.referer ? { Referer: options.referer } : {}),
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      ...(options.headers ?? {}),
    };

    const res = await fetch(url, {
      method: options.method ?? "GET",
      headers,
      body: options.body,
      redirect: options.redirect,
    });

    const setCookies = res.headers.getSetCookie?.() ?? [];
    if (setCookies.length > 0) {
      await this.setCookiesFromResponse(url, setCookies);
    }

    return res;
  }

  async request(
    url: string,
    options: {
      method?: string;
      body?: BodyInit;
      referer?: string;
      headers?: Record<string, string>;
      redirect?: RequestRedirect;
    }
  ): Promise<Response> {
    return this.rawRequest(url, {
      ...options,
      headers: {
        ...(this.accessToken
          ? { Authorization: `Bearer ${this.accessToken}` }
          : {}),
        ...(options.headers ?? {}),
      },
    });
  }

  async fetch<T>(
    url: string,
    options: {
      method?: string;
      body?: unknown;
      referer?: string;
      headers?: Record<string, string>;
    }
  ): Promise<T> {
    const headers = { ...(options.headers ?? {}) };
    const body = options.body === undefined ? undefined : JSON.stringify(options.body);
    if (body !== undefined && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    const res = await this.request(url, {
      method: options.method,
      body,
      referer: options.referer,
      headers,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
    }

    return res.json() as Promise<T>;
  }

  setTokens(tokens: {
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
  }): void {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    this.accessTokenExpiresAt = tokens.expiresIn
      ? Date.now() + tokens.expiresIn * 1000
      : undefined;
  }

  setAccessToken(token: string): void {
    this.setTokens({ accessToken: token });
  }

  getAccessToken(): string | undefined {
    return this.accessToken;
  }

  getRefreshToken(): string | undefined {
    return this.refreshToken;
  }

  isAccessTokenExpired(): boolean {
    return !!this.accessTokenExpiresAt && Date.now() >= this.accessTokenExpiresAt - 30_000;
  }

  async getCookies(domain: string): Promise<string> {
    return this.cookieJar.getCookieString(`https://${domain}/`);
  }

  isLoggedIn(): boolean {
    return !!this.accessToken;
  }

  async clearSession(): Promise<void> {
    this.accessToken = undefined;
    this.refreshToken = undefined;
    this.accessTokenExpiresAt = undefined;
    await this.cookieJar.removeAllCookies();
  }
}

export const client = new Client104();
