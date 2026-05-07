import { z } from "zod";
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const logoutSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare function login(params: z.infer<typeof loginSchema>): Promise<string>;
export declare function logout(_params: z.infer<typeof logoutSchema>): Promise<string>;
//# sourceMappingURL=auth.d.ts.map