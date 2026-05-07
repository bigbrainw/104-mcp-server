import { z } from "zod";
import { client } from "../client.js";

export const applyJobSchema = z.object({
  jobCode: z
    .string()
    .describe("Job short code (e.g. '8tft1' from https://www.104.com.tw/job/8tft1)"),
  coverLetter: z
    .string()
    .optional()
    .describe("Optional cover letter / self-introduction message"),
});

export const saveJobSchema = z.object({
  jobCode: z.string().describe("Job short code to save/bookmark"),
});

export const saveCompanySchema = z.object({
  companyCode: z.string().describe("Company short code to follow"),
});

interface ApplyResponse {
  data?: { applyId?: string };
  error?: { code: number; message: string };
}

interface JobMetaResponse {
  data: {
    jobNo: string;
    custNo: string;
  };
}

export async function applyJob(
  params: z.infer<typeof applyJobSchema>
): Promise<string> {
  if (!client.isLoggedIn()) {
    return "Not logged in. Use login tool first.";
  }

  const { jobCode, coverLetter } = params;

  // Fetch job detail to get numeric jobNo needed for apply
  const detailUrl = `https://www.104.com.tw/job/ajax/content/${jobCode}`;
  const detail = await client.fetch<{ data: { header: { jobName: string }; custNo: string } }>(
    detailUrl,
    { referer: `https://www.104.com.tw/job/${jobCode}` }
  );

  const jobName = detail.data.header.jobName;
  const custNo = detail.data.custNo;

  // Apply endpoint
  const applyUrl = `https://www.104.com.tw/job/ajax/apply/${jobCode}`;
  const body: Record<string, unknown> = {
    jobNo: jobCode,
    custNo,
  };
  if (coverLetter) {
    body.selfIntro = coverLetter;
  }

  try {
    const result = await client.fetch<ApplyResponse>(applyUrl, {
      method: "POST",
      body,
      referer: `https://www.104.com.tw/job/${jobCode}`,
    });

    if (result.error) {
      return `Apply failed: ${result.error.message} (code ${result.error.code})`;
    }

    return `Successfully applied to "${jobName}"! Application ID: ${result.data?.applyId ?? "N/A"}`;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("401")) {
      return "Authentication expired. Please login again.";
    }
    return `Apply failed: ${msg}`;
  }
}

export async function saveJob(
  params: z.infer<typeof saveJobSchema>
): Promise<string> {
  if (!client.isLoggedIn()) {
    return "Not logged in. Use login tool first.";
  }

  const url = `https://www.104.com.tw/job/ajax/save/${params.jobCode}`;
  try {
    await client.fetch(url, {
      method: "POST",
      body: {},
      referer: `https://www.104.com.tw/job/${params.jobCode}`,
    });
    return `Job ${params.jobCode} saved to your bookmarks.`;
  } catch (err) {
    return `Save failed: ${err instanceof Error ? err.message : String(err)}`;
  }
}

export async function saveCompany(
  params: z.infer<typeof saveCompanySchema>
): Promise<string> {
  if (!client.isLoggedIn()) {
    return "Not logged in. Use login tool first.";
  }

  const url = `https://www.104.com.tw/api/companies/${params.companyCode}/follow`;
  try {
    await client.fetch(url, {
      method: "POST",
      body: {},
      referer: `https://www.104.com.tw/company/${params.companyCode}`,
    });
    return `Now following company ${params.companyCode}.`;
  } catch (err) {
    return `Follow failed: ${err instanceof Error ? err.message : String(err)}`;
  }
}
