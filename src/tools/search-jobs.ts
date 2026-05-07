import { z } from "zod";
import { client } from "../client.js";
import type { Job } from "../types.js";

export const searchJobsSchema = z.object({
  keyword: z.string().optional().describe("Search keyword (English or Chinese)"),
  area: z
    .string()
    .optional()
    .describe(
      "Location code. Common: 6001001000=台北市, 6001002000=新北市, 6001005000=台中市, 6001008000=高雄市"
    ),
  ro: z
    .number()
    .int()
    .min(0)
    .max(1)
    .optional()
    .describe("Job type: 0=full-time (default), 1=part-time"),
  order: z
    .number()
    .int()
    .optional()
    .describe("Sort order: 15=newest (default), 1=relevance"),
  page: z.number().int().min(1).optional().describe("Page number (default 1)"),
  edu: z
    .string()
    .optional()
    .describe(
      "Education level: 1=高中以下, 2=高中, 3=專科, 4=大學, 5=碩士, 6=博士"
    ),
  remoteWork: z
    .number()
    .int()
    .min(1)
    .max(2)
    .optional()
    .describe("Remote work: 1=partial, 2=full"),
  s9: z
    .string()
    .optional()
    .describe(
      "Experience (comma-separated): 1=應屆畢業, 2=1年以下, 3=1-3年, 4=3-5年, 5=5-10年, 6=10年以上"
    ),
});

interface SearchResponse {
  data: Job[];
  metadata: {
    pagination: {
      count: number;
      currentPage: number;
      lastPage: number;
      total: number;
    };
  };
}

export async function searchJobs(
  params: z.infer<typeof searchJobsSchema>
): Promise<string> {
  const query = new URLSearchParams();
  if (params.keyword) query.set("keyword", params.keyword);
  if (params.area) query.set("area", params.area);
  if (params.ro !== undefined) query.set("ro", String(params.ro));
  if (params.order !== undefined) query.set("order", String(params.order));
  if (params.page) query.set("page", String(params.page));
  if (params.edu) query.set("edu", params.edu);
  if (params.remoteWork !== undefined)
    query.set("remoteWork", String(params.remoteWork));
  if (params.s9) query.set("s9", params.s9);
  query.set("asc", "0");
  query.set("jobsource", "2018indexpoc");

  const url = `https://www.104.com.tw/jobs/search/api/jobs?${query}`;
  const result = await client.fetch<SearchResponse>(url, {
    referer: "https://www.104.com.tw/jobs/search/",
  });

  const { data: jobs, metadata } = result;
  const { pagination } = metadata;

  const lines = [
    `Found ${pagination.total} jobs (page ${pagination.currentPage}/${pagination.lastPage})`,
    "",
  ];

  for (const job of jobs) {
    const shortCode = job.link.job.split("/").pop() ?? "";
    const salary =
      job.salaryLow && job.salaryHigh
        ? `${(job.salaryLow / 10000).toFixed(0)}~${(job.salaryHigh / 10000).toFixed(0)}萬`
        : "面議";
    lines.push(
      `[${shortCode}] ${job.jobName}`,
      `  Company: ${job.custName}`,
      `  Location: ${job.jobAddrNoDesc}`,
      `  Salary: ${salary}`,
      `  Posted: ${job.appearDate}`,
      `  Applied: ${job.applyCnt} people`,
      job.remoteWorkType > 0 ? `  Remote: ${job.remoteWorkType === 2 ? "Full" : "Partial"}` : "",
      ""
    );
  }

  lines.push(
    `Use get_job_detail with job code (e.g. "${jobs[0]?.link.job.split("/").pop()}") for full details.`
  );

  return lines.filter((l) => l !== undefined).join("\n");
}
