import { z } from "zod";
export declare const jobDetailSchema: z.ZodObject<{
    jobCode: z.ZodString;
}, "strip", z.ZodTypeAny, {
    jobCode: string;
}, {
    jobCode: string;
}>;
export declare function getJobDetail(params: z.infer<typeof jobDetailSchema>): Promise<string>;
//# sourceMappingURL=job-detail.d.ts.map