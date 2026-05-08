export const config = { runtime: "edge" };

const BASE_HEADERS = {
  "User-Agent": "104-mcp-client/1.0 (https://github.com/bigbrainw/104-mcp-server)",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
  Referer: "https://www.104.com.tw/jobs/search/",
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

export default async function handler(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

  const url = new URL(request.url);
  const q = new URLSearchParams();
  for (const key of ["keyword", "area", "ro", "order", "page", "edu", "remoteWork", "s9"]) {
    const v = url.searchParams.get(key);
    if (v) q.set(key, v);
  }
  q.set("asc", "0");
  q.set("jobsource", "2018indexpoc");

  try {
    const res = await fetch(`https://www.104.com.tw/jobs/search/api/jobs?${q}`, { headers: BASE_HEADERS });
    if (!res.ok) return new Response(JSON.stringify({ error: `104 API error: ${res.status}` }), { status: res.status, headers: CORS });
    const data = await res.json();
    return new Response(JSON.stringify(data), { headers: CORS });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: CORS });
  }
}
