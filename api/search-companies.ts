export const config = { runtime: "edge" };

const BASE_HEADERS = {
  "User-Agent": "104-mcp-client/1.0 (https://github.com/bigbrainw/104-mcp-server)",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
  Referer: "https://www.104.com.tw/company/search/",
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default async function handler(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

  const url = new URL(request.url);
  const keyword = url.searchParams.get("keyword");
  if (!keyword) return Response.json({ error: "keyword is required" }, { status: 400, headers: CORS });

  const q = new URLSearchParams({
    keyword,
    page: url.searchParams.get("page") ?? "1",
    pageSize: url.searchParams.get("pageSize") ?? "10",
  });

  try {
    const res = await fetch(`https://www.104.com.tw/company/ajax/list?${q}`, { headers: BASE_HEADERS });
    if (!res.ok) return Response.json({ error: `104 API error: ${res.status}` }, { status: res.status, headers: CORS });
    const data = await res.json();
    return Response.json(data, { headers: CORS });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500, headers: CORS });
  }
}
