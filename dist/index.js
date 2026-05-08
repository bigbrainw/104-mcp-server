#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { searchJobsSchema, searchJobs } from "./tools/search-jobs.js";
import { jobDetailSchema, getJobDetail } from "./tools/job-detail.js";
import { searchCompaniesSchema, searchCompanies, } from "./tools/search-companies.js";
import { companyDetailSchema, getCompanyDetail } from "./tools/company-detail.js";
import { loginSchema, logoutSchema, login, logout } from "./tools/auth.js";
import { applyJobSchema, saveJobSchema, saveCompanySchema, applyJob, saveJob, saveCompany, } from "./tools/apply.js";
const server = new McpServer({
    name: "104-mcp-server",
    version: "1.0.0",
});
const readOnlyAnnotations = {
    readOnlyHint: true,
    openWorldHint: false,
    destructiveHint: false,
};
const accountWriteAnnotations = {
    readOnlyHint: false,
    openWorldHint: false,
    destructiveHint: false,
};
const applyJobAnnotations = {
    readOnlyHint: false,
    openWorldHint: true,
    destructiveHint: false,
};
// ── Job Search ──────────────────────────────────────────────────────────────
server.registerTool("search_jobs", {
    description: "Search job listings on 104.com.tw. Returns a list of matching jobs with salary, location, and job codes.",
    inputSchema: searchJobsSchema,
    annotations: readOnlyAnnotations,
}, async (params) => {
    const result = await searchJobs(params);
    return { content: [{ type: "text", text: result }] };
});
server.registerTool("get_job_detail", {
    description: "Get full details of a job posting on 104.com.tw including description, requirements, salary, welfare, and contact info.",
    inputSchema: jobDetailSchema,
    annotations: readOnlyAnnotations,
}, async (params) => {
    const result = await getJobDetail(params);
    return { content: [{ type: "text", text: result }] };
});
// ── Company Search ───────────────────────────────────────────────────────────
server.registerTool("search_companies", {
    description: "Search companies on 104.com.tw by name. Returns company codes, industry, location, and open job count.",
    inputSchema: searchCompaniesSchema,
    annotations: readOnlyAnnotations,
}, async (params) => {
    const result = await searchCompanies(params);
    return { content: [{ type: "text", text: result }] };
});
server.registerTool("get_company_detail", {
    description: "Get full company profile from 104.com.tw including about, products, benefits, and optionally current job listings.",
    inputSchema: companyDetailSchema,
    annotations: readOnlyAnnotations,
}, async (params) => {
    const result = await getCompanyDetail(params);
    return { content: [{ type: "text", text: result }] };
});
// ── Auth ─────────────────────────────────────────────────────────────────────
server.registerTool("login", {
    description: "Log in to your 104.com.tw account. Required for applying to jobs, saving jobs/companies.",
    inputSchema: loginSchema,
    annotations: accountWriteAnnotations,
}, async (params) => {
    const result = await login(params);
    return { content: [{ type: "text", text: result }] };
});
server.registerTool("logout", {
    description: "Log out of your 104.com.tw account.",
    inputSchema: logoutSchema,
    annotations: accountWriteAnnotations,
}, async (params) => {
    const result = await logout(params);
    return { content: [{ type: "text", text: result }] };
});
// ── Apply / Save ─────────────────────────────────────────────────────────────
server.registerTool("apply_job", {
    description: "Apply to a job on 104.com.tw. Requires being logged in. Optionally include a cover letter.",
    inputSchema: applyJobSchema,
    annotations: applyJobAnnotations,
}, async (params) => {
    const result = await applyJob(params);
    return { content: [{ type: "text", text: result }] };
});
server.registerTool("save_job", {
    description: "Bookmark/save a job posting. Requires being logged in.",
    inputSchema: saveJobSchema,
    annotations: accountWriteAnnotations,
}, async (params) => {
    const result = await saveJob(params);
    return { content: [{ type: "text", text: result }] };
});
server.registerTool("save_company", {
    description: "Follow a company on 104.com.tw. Requires being logged in.",
    inputSchema: saveCompanySchema,
    annotations: accountWriteAnnotations,
}, async (params) => {
    const result = await saveCompany(params);
    return { content: [{ type: "text", text: result }] };
});
// ── Start ─────────────────────────────────────────────────────────────────────
const transport = new StdioServerTransport();
await server.connect(transport);
//# sourceMappingURL=index.js.map