export declare class Client104 {
    private cookieJar;
    private accessToken?;
    constructor();
    private getCookieHeader;
    private setCookiesFromResponse;
    fetch<T>(url: string, options: {
        method?: string;
        body?: unknown;
        referer: string;
        headers?: Record<string, string>;
    }): Promise<T>;
    setAccessToken(token: string): void;
    getAccessToken(): string | undefined;
    getCookies(domain: string): Promise<string>;
    isLoggedIn(): boolean;
}
export declare const client: Client104;
//# sourceMappingURL=client.d.ts.map