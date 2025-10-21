import { z } from "zod";
export declare const MailActionEnum: z.ZodEnum<{
    register: "register";
    login: "login";
    "reset-password": "reset-password";
}>;
export declare const SendCodeSchema: z.ZodObject<{
    email: z.ZodEmail;
    action: z.ZodEnum<{
        register: "register";
        login: "login";
        "reset-password": "reset-password";
    }>;
}, z.core.$strip>;
export type SendCodeData = z.infer<typeof SendCodeSchema>;
export type MailAction = z.infer<typeof MailActionEnum>;
