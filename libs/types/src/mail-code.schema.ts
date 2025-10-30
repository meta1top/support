import { z } from "zod";

export const MailActionEnum = z.enum(["register", "login", "reset-password"]);
export type MailAction = z.infer<typeof MailActionEnum>;

export const SendCodeSchema = z.object({
  email: z.string().email({ message: "邮箱格式不正确" }).describe("邮箱"),
  action: z.enum(["register", "login", "reset-password"]).describe("操作类型"),
});

export type SendCodeData = z.infer<typeof SendCodeSchema>;
