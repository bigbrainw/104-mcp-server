import type { IncomingMessage, ServerResponse } from "node:http";

const BASE_HEADERS = {
  "User-Agent": "104-mcp-client/1.0 (https://github.com/bigbrainw/104-mcp-server)",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
  Referer: "https://www.104.com.tw/jobs/search/",
};

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");
  if (req.method === "OPTIONS") { res.end(); return; }

  const url = new URL(req.url ?? "/", "https://host");
  const q = new URLSearchParams({ asc: "0", jobsource: "2018indexpoc" });
  for (const key of ["keyword", "area", "ro", "order", "page", "edu", "remoteWork", "s9"]) {
    const v = url.searchParams.get(key);
    if (v) q.set(key, v);
  }

  try {
    const r = await fetch(`https://www.104.com.tw/jobs/search/api/jobs?${q}`, { headers: BASE_HEADERS });
    const data = await r.json();
    res.statusCode = r.status;
    res.end(JSON.stringify(data));
  } catch (e: any) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: e.message }));
  }
}
