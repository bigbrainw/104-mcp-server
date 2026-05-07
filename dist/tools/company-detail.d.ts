import { z } from "zod";
export declare const companyDetailSchema: z.ZodObject<{
    companyCode: z.ZodString;
    includeJobs: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    companyCode: string;
    includeJobs?: boolean | undefined;
}, {
    companyCode: string;
    includeJobs?: boolean | undefined;
}>;
export declare function getCompanyDetail(params: z.infer<typeof companyDetailSchema>): Promise<string>;
//# sourceMappingURL=company-detail.d.ts.map