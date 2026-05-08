import type { IncomingMessage, ServerResponse } from "node:http";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";

const UA = "104-mcp-client/1.0 (https://github.com/bigbrainw/104-mcp-server)";
const BASE = {
  "User-Agent": UA,
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
};

async function fetch104<T>(url: string, referer: string): Promise<T> {
  const res = await fetch(url, { headers: { ...BASE, Referer: referer } });
  if (!res.ok) throw new Error(`104 API error: ${res.status}`);
  return res.json() as Promise<T>;
}

function createServer() {
  const server = new McpServer({ name: "104jobs", version: "1.0.0" });

  server.tool(
    "search_jobs",
    "Search job listings on 104.com.tw (Taiwan's largest job platform)",
    {
      keyword: z.string().optional().describe("Search keyword in English or Chinese"),
      area: z.string().optional().describe("Location code: 6001001000=台北市 6001002000=新北市 6001005000=台中市 6001008000=高雄市"),
      ro: z.number().int().min(0).max(1).optional().describe("0=full-time 1=part-time"),
      remoteWork: z.number().int().min(1).max(2).optional().describe("1=partial remote 2=fully remote"),
      edu: z.string().optional().describe("Education: 1=高中以下 2=高中 3=專科 4=大學 5=碩士 6=博士"),
      s9: z.string().optional().describe("Experience: 1=應屆 2=1年以下 3=1-3年 4=3-5年 5=5-10年 6=10年以上"),
      page: z.number().int().min(1).optional().describe("Page number"),
    },
    async (params) => {
      const q = new URLSearchParams({ asc: "0", jobsource: "2018indexpoc" });
      if (params.keyword) q.set("keyword", params.keyword);
      if (params.area) q.set("area", params.area);
      if (params.ro !== undefined) q.set("ro", String(params.ro));
      if (params.remoteWork !== undefined) q.set("remoteWork", String(params.remoteWork));
      if (params.edu) q.set("edu", params.edu);
      if (params.s9) q.set("s9", params.s9);
      if (params.page) q.set("page", String(params.page));

      const data = await fetch104<any>(
        `https://www.104.com.tw/jobs/search/api/jobs?${q}`,
        "https://www.104.com.tw/jobs/search/"
      );
      const jobs = data.data ?? [];
      const p = data.metadata?.pagination ?? {};
      const lines = [`Found ${p.total ?? "?"} jobs (page ${p.currentPage ?? 1}/${p.lastPage ?? 1})`, ""];
      for (const job of jobs) {
        const code = job.link?.job?.split("/").pop() ?? "";
        const salary = job.salaryLow && job.salaryHigh
          ? `${(job.salaryLow / 10000).toFixed(0)}~${(job.salaryHigh / 10000).toFixed(0)}萬`
          : "面議";
        lines.push(`[${code}] ${job.jobName}`, `  ${job.custName} | ${job.jobAddrNoDesc} | ${salary}`, "");
      }
      return { content: [{ type: "text" as const, text: lines.join("\n") }] };
    }
  );

  server.tool(
    "get_job_detail",
    "Get full details for a job listing on 104.com.tw",
    { jobCode: z.string().describe("Job code e.g. '8tft1' from https://www.104.com.tw/job/8tft1") },
    async ({ jobCode }) => {
      const data = await fetch104<any>(
        `https://www.104.com.tw/job/ajax/content/${jobCode}`,
        `https://www.104.com.tw/job/${jobCode}`
      );
      const d = data.data;
      const j = d.jobDetail;
      const lines = [
        `=== ${d.header.jobName} ===`,
        `Company: ${d.header.custName}`,
        `Salary: ${j.salary}`,
        `Location: ${j.addressRegion} ${j.addressDetail}`,
        j.remoteWork ? `Remote: ${j.remoteWork}` : "",
        `Experience: ${d.condition.workExp}`,
        `Education: ${d.condition.edu}`,
        "", "--- Description ---", j.jobDescription,
        "", "--- Welfare ---", d.welfare.welfare || "(not provided)",
      ];
      return { content: [{ type: "text" as const, text: lines.filter(Boolean).join("\n") }] };
    }
  );

  server.tool(
    "search_companies",
    "Search companies on 104.com.tw",
    {
      keyword: z.string().describe("Company name keyword"),
      page: z.number().int().min(1).optional(),
      pageSize: z.number().int().min(1).max(50).optional(),
    },
    async (params) => {
      const q = new URLSearchParams({
        keyword: params.keyword,
        page: String(params.page ?? 1),
        pageSize: String(params.pageSize ?? 10),
      });
      const data = await fetch104<any>(
        `https://www.104.com.tw/company/ajax/list?${q}`,
        "https://www.104.com.tw/company/search/"
      );
      const companies = data.data ?? [];
      const p = data.metadata?.pagination ?? {};
      const lines = [`Found ${p.total ?? "?"} companies`, ""];
      for (const co of companies) {
        lines.push(`[${co.encodedCustNo}] ${co.name}`, `  ${co.industryDesc} | ${co.areaDesc} | ${co.employeeCountDesc} | ${co.jobCount} jobs`, "");
      }
      return { content: [{ type: "text" as const, text: lines.join("\n") }] };
    }
  );

  server.tool(
    "get_company_detail",
    "Get full company profile from 104.com.tw",
    {
      companyCode: z.string().describe("Company code e.g. '1a2x6bmutz' from https://www.104.com.tw/company/1a2x6bmutz"),
      includeJobs: z.boolean().optional().describe("Include current job listings"),
    },
    async ({ companyCode, includeJobs }) => {
      const referer = `https://www.104.com.tw/company/${companyCode}`;
      const data = await fetch104<any>(`https://www.104.com.tw/api/companies/${companyCode}/content`, referer);
      const d = data.data;
      const lines = [
        `=== ${d.custName} ===`,
        `Industry: ${d.industryDesc}`,
        `Employees: ${d.empNo}`,
        `Address: ${d.address}`,
        d.custLink ? `Website: ${d.custLink}` : "",
        "", d.profile ? `--- Profile ---\n${d.profile}` : "",
        d.welfare ? `--- Benefits ---\n${d.welfare}` : "",
      ];
      if (includeJobs) {
        const jobs = await fetch104<any>(`https://www.104.com.tw/api/companies/${companyCode}/jobs?page=1&pageSize=10`, referer);
        const all = [...(jobs.data?.list?.topJobs ?? []), ...(jobs.data?.list?.normalJobs ?? [])];
        if (all.length) {
          lines.push("--- Openings ---");
          for (const j of all) lines.push(`[${j.encodedJobNo}] ${j.jobName} | ${j.jobSalaryDesc ?? "面議"}`);
        }
      }
      return { content: [{ type: "text" as const, text: lines.filter(Boolean).join("\n") }] };
    }
  );

  return server;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  const server = createServer();
  await server.connect(transport);

  // collect body for POST requests
  const body = await new Promise<string>((resolve) => {
    let data = "";
    req.on("data", (chunk) => { data += chunk; });
    req.on("end", () => resolve(data));
  });

  const parsedBody = body ? JSON.parse(body) : undefined;
  await transport.handleRequest(req, res, parsedBody);
  await server.close();
}
