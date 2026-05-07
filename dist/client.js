import { CookieJar } from "tough-cookie";
const BASE_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    Accept: "application/json, text/plain, */*",
    "Accept-Language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
};
export class Client104 {
    cookieJar;
    accessToken;
    constructor() {
        this.cookieJar = new CookieJar();
    }
    async getCookieHeader(url) {
        return this.cookieJar.getCookieString(url);
    }
    async setCookiesFromResponse(url, setCookieHeaders) {
        for (const cookie of setCookieHeaders) {
            await this.cookieJar.setCookie(cookie, url);
        }
    }
    async fetch(url, options) {
        const cookieHeader = await this.getCookieHeader(url);
        const headers = {
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
        return res.json();
    }
    setAccessToken(token) {
        this.accessToken = token;
    }
    getAccessToken() {
        return this.accessToken;
    }
    async getCookies(domain) {
        return this.cookieJar.getCookieString(`https://${domain}/`);
    }
    isLoggedIn() {
        return !!this.accessToken;
    }
}
export const client = new Client104();
//# sourceMappingURL=client.js.map