import { z } from "zod";
export declare const searchJobsSchema: z.ZodObject<{
    keyword: z.ZodOptional<z.ZodString>;
    area: z.ZodOptional<z.ZodString>;
    ro: z.ZodOptional<z.ZodNumber>;
    order: z.ZodOptional<z.ZodNumber>;
    page: z.ZodOptional<z.ZodNumber>;
    edu: z.ZodOptional<z.ZodString>;
    remoteWork: z.ZodOptional<z.ZodNumber>;
    s9: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    keyword?: string | undefined;
    area?: string | undefined;
    ro?: number | undefined;
    order?: number | undefined;
    page?: number | undefined;
    edu?: string | undefined;
    remoteWork?: number | undefined;
    s9?: string | undefined;
}, {
    keyword?: string | undefined;
    area?: string | undefined;
    ro?: number | undefined;
    order?: number | undefined;
    page?: number | undefined;
    edu?: string | undefined;
    remoteWork?: number | undefined;
    s9?: string | undefined;
}>;
export declare function searchJobs(params: z.infer<typeof searchJobsSchema>): Promise<string>;
//# sourceMappingURL=search-jobs.d.ts.map