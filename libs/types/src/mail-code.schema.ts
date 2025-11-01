import { z } from "zod";

export const SendCodeSchema = z.object({
  email: z.string().email({ message: "邮箱格式不正确" }).describe("邮箱"),
  action: z.string().describe("操作类型"),
});

export type SendCodeData = z.infer<typeof SendCodeSchema>;
