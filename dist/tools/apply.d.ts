import { z } from "zod";
export declare const applyJobSchema: z.ZodObject<{
    jobCode: z.ZodString;
    coverLetter: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    jobCode: string;
    coverLetter?: string | undefined;
}, {
    jobCode: string;
    coverLetter?: string | undefined;
}>;
export declare const saveJobSchema: z.ZodObject<{
    jobCode: z.ZodString;
}, "strip", z.ZodTypeAny, {
    jobCode: string;
}, {
    jobCode: string;
}>;
export declare const saveCompanySchema: z.ZodObject<{
    companyCode: z.ZodString;
}, "strip", z.ZodTypeAny, {
    companyCode: string;
}, {
    companyCode: string;
}>;
export declare function applyJob(params: z.infer<typeof applyJobSchema>): Promise<string>;
export declare function saveJob(params: z.infer<typeof saveJobSchema>): Promise<string>;
export declare function saveCompany(params: z.infer<typeof saveCompanySchema>): Promise<string>;
//# sourceMappingURL=apply.d.ts.map