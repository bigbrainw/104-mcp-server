import { z } from "zod";
import { client } from "../client.js";
export const companyDetailSchema = z.object({
    companyCode: z
        .string()
        .describe("Company short code from URL (e.g. '1a2x6bmutz' from https://www.104.com.tw/company/1a2x6bmutz)"),
    includeJobs: z
        .boolean()
        .optional()
        .describe("Include current job listings (default false)"),
});
export async function getCompanyDetail(params) {
    const { companyCode } = params;
    const referer = `https://www.104.com.tw/company/${companyCode}`;
    const detailUrl = `https://www.104.com.tw/api/companies/${companyCode}/content`;
    const result = await client.fetch(detailUrl, {
        referer,
    });
    const d = result.data;
    const lines = [
        `=== ${d.custName} ===`,
        `Industry: ${d.industryDesc}`,
        `Employees: ${d.empNo}`,
        `Capital: ${d.capital}`,
        `Address: ${d.address}`,
        d.custLink ? `Website: ${d.custLink}` : "",
        d.hrName ? `HR Contact: ${d.hrName}` : "",
        `Followers: ${d.followerCount}`,
        d.follow
            ? `Status: ${d.follow.isSaved ? "Saved" : "Not saved"} | Following ${d.follow.followedJobCount} jobs`
            : "",
        "",
    ];
    if (d.profile) {
        lines.push("--- Company Profile ---", d.profile, "");
    }
    if (d.product) {
        lines.push("--- Products/Services ---", d.product, "");
    }
    if (d.welfare) {
        lines.push("--- Benefits ---", d.welfare, "");
    }
    if (params.includeJobs) {
        const jobsUrl = `https://www.104.com.tw/api/companies/${companyCode}/jobs?page=1&pageSize=10`;
        const jobsResult = await client.fetch(jobsUrl, {
            referer,
        });
        const { topJobs, normalJobs } = jobsResult.data.list;
        const allJobs = [...topJobs, ...normalJobs];
        if (allJobs.length > 0) {
            lines.push("--- Current Openings ---");
            for (const job of allJobs) {
                const code = job.encodedJobNo;
                lines.push(`[${code}] ${job.jobName}`, `  Salary: ${job.jobSalaryDesc ?? "面議"}`, `  Location: ${job.jobAddrNoDesc ?? ""}`, "");
            }
        }
    }
    lines.push(`Profile URL: https://www.104.com.tw/company/${companyCode}`);
    return lines.filter((l) => l !== undefined).join("\n");
}
//# sourceMappingURL=company-detail.js.map