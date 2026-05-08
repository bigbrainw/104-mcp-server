import type { IncomingMessage, ServerResponse } from "node:http";

const BASE_HEADERS = {
  "User-Agent": "104-mcp-client/1.0 (https://github.com/bigbrainw/104-mcp-server)",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
};

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");
  if (req.method === "OPTIONS") { res.end(); return; }

  const code = (req.url ?? "").split("/").pop()?.split("?")[0];
  if (!code) { res.statusCode = 400; res.end(JSON.stringify({ error: "Missing job code" })); return; }

  try {
    const r = await fetch(`https://www.104.com.tw/job/ajax/content/${code}`, {
      headers: { ...BASE_HEADERS, Referer: `https://www.104.com.tw/job/${code}` },
    });
    const data = await r.json();
    res.statusCode = r.status;
    res.end(JSON.stringify(data));
  } catch (e: any) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: e.message }));
  }
}
