export const config = { runtime: "edge" };

const BASE_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default async function handler(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

  const url = new URL(request.url);
  const code = url.pathname.split("/").pop();
  if (!code) return Response.json({ error: "Missing company code" }, { status: 400, headers: CORS });

  const referer = `https://www.104.com.tw/company/${code}`;

  try {
    const res = await fetch(`https://www.104.com.tw/api/companies/${code}/content`, {
      headers: { ...BASE_HEADERS, Referer: referer },
    });
    if (!res.ok) return Response.json({ error: `104 API error: ${res.status}` }, { status: res.status, headers: CORS });
    const data = await res.json();

    const includeJobs = url.searchParams.get("includeJobs") === "true";
    if (includeJobs) {
      const jobsRes = await fetch(`https://www.104.com.tw/api/companies/${code}/jobs?page=1&pageSize=10`, {
        headers: { ...BASE_HEADERS, Referer: referer },
      });
      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        data.data = { ...data.data, jobs: jobsData.data };
      }
    }

    return Response.json(data, { headers: CORS });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500, headers: CORS });
  }
}
