import { z } from "zod";
export declare const searchCompaniesSchema: z.ZodObject<{
    keyword: z.ZodString;
    page: z.ZodOptional<z.ZodNumber>;
    pageSize: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    keyword: string;
    page?: number | undefined;
    pageSize?: number | undefined;
}, {
    keyword: string;
    page?: number | undefined;
    pageSize?: number | undefined;
}>;
export declare function searchCompanies(params: z.infer<typeof searchCompaniesSchema>): Promise<string>;
//# sourceMappingURL=search-companies.d.ts.map