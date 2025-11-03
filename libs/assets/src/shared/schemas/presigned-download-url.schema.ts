import { z } from "zod";

import { BucketType } from "../constants";

/**
 * 预签名下载 URL 请求参数 Schema
 */
export const PresignedDownloadUrlRequestSchema = z.object({
  fileKey: z.string().min(1, { message: "文件 Key 不能为空" }).describe("文件 Key"),
  bucketType: z.nativeEnum(BucketType).describe("桶类型"),
});

export type PresignedDownloadUrlRequestData = z.infer<typeof PresignedDownloadUrlRequestSchema>;

/**
 * 预签名下载 URL 响应 Schema
 */
export const PresignedDownloadUrlResponseSchema = z.object({
  downloadUrl: z.string().describe("预签名下载 URL"),
  expiresAt: z.number().describe("过期时间（Unix 时间戳，毫秒）。如果是公桶，则为 0（不过期）"),
});

export type PresignedDownloadUrlResponseData = z.infer<typeof PresignedDownloadUrlResponseSchema>;
