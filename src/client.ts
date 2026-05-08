import { CookieJar } from "tough-cookie";

const BASE_HEADERS = {
  "User-Agent": "104-mcp-client/1.0 (https://github.com/bigbrainw/104-mcp-server)",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
};

export class Client104 {
  private cookieJar: CookieJar;
  private accessToken?: string;

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

  async fetch<T>(
    url: string,
    options: {
      method?: string;
      body?: unknown;
      referer: string;
      headers?: Record<string, string>;
    }
  ): Promise<T> {
    const cookieHeader = await this.getCookieHeader(url);
    const headers: Record<string, string> = {
      ...BASE_HEADERS,
      Referer: options.referer,
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      ...(this.accessToken
        ? { Authorization: `Bearer ${this.accessToken}` }
        : {}),
      ...(options.headers ?? {}),
    };

    if (options.body) {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(url, {
      method: options.method ?? "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const setCookies = res.headers.getSetCookie?.() ?? [];
    if (setCookies.length > 0) {
      await this.setCookiesFromResponse(url, setCookies);
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
    }

    return res.json() as Promise<T>;
  }

  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  getAccessToken(): string | undefined {
    return this.accessToken;
  }

  async getCookies(domain: string): Promise<string> {
    return this.cookieJar.getCookieString(`https://${domain}/`);
  }

  isLoggedIn(): boolean {
    return !!this.accessToken;
  }
}

export const client = new Client104();
