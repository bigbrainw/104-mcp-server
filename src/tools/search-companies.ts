import { z } from "zod";
import { client } from "../client.js";
import type { Company } from "../types.js";

export const searchCompaniesSchema = z.object({
  keyword: z.string().describe("Company name keyword (English or Chinese)"),
  page: z.number().int().min(1).optional().describe("Page number (default 1)"),
  pageSize: z
    .number()
    .int()
    .min(1)
    .max(50)
    .optional()
    .describe("Results per page (default 10, max 50)"),
});

interface CompanySearchResponse {
  data: Company[];
  metadata: {
    pagination: {
      count: number;
      total: number;
      currentPage: number;
      lastPage: number;
    };
  };
}

export async function searchCompanies(
  params: z.infer<typeof searchCompaniesSchema>
): Promise<string> {
  const query = new URLSearchParams({
    keyword: params.keyword,
    page: String(params.page ?? 1),
    pageSize: String(params.pageSize ?? 10),
  });

  const url = `https://www.104.com.tw/company/ajax/list?${query}`;
  const result = await client.fetch<CompanySearchResponse>(url, {
    referer: "https://www.104.com.tw/company/search/",
  });

  const { data: companies, metadata } = result;
  const { pagination } = metadata;

  const lines = [
    `Found ${pagination.total} companies (page ${pagination.currentPage}/${pagination.lastPage})`,
    "",
  ];

  for (const co of companies) {
    lines.push(
      `[${co.encodedCustNo}] ${co.name}`,
      `  Industry: ${co.industryDesc}`,
      `  Location: ${co.areaDesc}`,
      `  Employees: ${co.employeeCountDesc}`,
      `  Capital: ${co.capitalDesc}`,
      `  Open jobs: ${co.jobCount}`,
      co.profile ? `  About: ${co.profile.slice(0, 100)}...` : "",
      ""
    );
  }

  lines.push(
    `Use get_company_detail with company code (e.g. "${companies[0]?.encodedCustNo}") for full profile.`
  );

  return lines.filter((l) => l !== undefined).join("\n");
}
