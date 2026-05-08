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

  const url = new URL(req.url ?? "/", "https://host");
  const code = url.pathname.split("/").pop();
  if (!code) { res.statusCode = 400; res.end(JSON.stringify({ error: "Missing company code" })); return; }

  const referer = `https://www.104.com.tw/company/${code}`;
  try {
    const r = await fetch(`https://www.104.com.tw/api/companies/${code}/content`, {
      headers: { ...BASE_HEADERS, Referer: referer },
    });
    const data = await r.json();

    if (url.searchParams.get("includeJobs") === "true") {
      const jr = await fetch(`https://www.104.com.tw/api/companies/${code}/jobs?page=1&pageSize=10`, {
        headers: { ...BASE_HEADERS, Referer: referer },
      });
      if (jr.ok) data.data = { ...data.data, jobs: (await jr.json()).data };
    }

    res.statusCode = r.status;
    res.end(JSON.stringify(data));
  } catch (e: any) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: e.message }));
  }
}
