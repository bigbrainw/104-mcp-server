import { z } from "zod";
import { client } from "../client.js";
import type { JobDetail } from "../types.js";

export const jobDetailSchema = z.object({
  jobCode: z
    .string()
    .describe(
      "Job short code from URL (e.g. '8tft1' from https://www.104.com.tw/job/8tft1)"
    ),
});

interface JobDetailResponse {
  data: JobDetail & {
    custLogo: string;
    custNo: string;
    industry: string;
    employees: string;
    chinaCorp: boolean;
  };
}

export async function getJobDetail(
  params: z.infer<typeof jobDetailSchema>
): Promise<string> {
  const { jobCode } = params;
  const url = `https://www.104.com.tw/job/ajax/content/${jobCode}`;
  const result = await client.fetch<JobDetailResponse>(url, {
    referer: `https://www.104.com.tw/job/${jobCode}`,
  });

  const d = result.data;
  const j = d.jobDetail;

  const lines = [
    `=== ${d.header.jobName} ===`,
    `Company: ${d.header.custName} (${d.industry}, ${d.employees})`,
    `Posted: ${d.header.appearDate}`,
    "",
    `--- Salary & Location ---`,
    `Salary: ${j.salary}`,
    `Location: ${j.addressRegion} ${j.addressDetail}`,
    j.remoteWork ? `Remote: ${j.remoteWork}` : "",
    `Job type: ${j.jobType === 1 ? "Full-time" : "Part-time"}`,
    `Positions: ${j.needEmp}`,
    `Management: ${j.manageResp}`,
    "",
    `--- Requirements ---`,
    `Experience: ${d.condition.workExp}`,
    `Education: ${d.condition.edu}`,
    d.condition.major.length > 0
      ? `Major: ${d.condition.major.join(", ")}`
      : "",
    d.condition.specialty.length > 0
      ? `Skills: ${d.condition.specialty.map((s) => s.description).join(", ")}`
      : "",
    "",
    `--- Job Categories ---`,
    j.jobCategory.map((c) => c.description).join(", "),
    "",
    `--- Description ---`,
    j.jobDescription,
    "",
    `--- Welfare ---`,
    d.welfare.welfare || "(not provided)",
    "",
    `--- Contact ---`,
    `HR: ${d.contact.hrName}`,
    d.contact.email ? `Email: ${d.contact.email}` : "",
    `Response policy: ${d.contact.reply}`,
    "",
    `Applied: ${d.header.isApplied ? "Yes" : "No"} | Saved: ${d.header.isSaved ? "Yes" : "No"}`,
    `Company profile: ${d.header.custUrl}`,
    `Apply URL: https://www.104.com.tw/job/${jobCode}`,
  ];

  return lines.filter((l) => l !== undefined && l !== "").join("\n");
}
