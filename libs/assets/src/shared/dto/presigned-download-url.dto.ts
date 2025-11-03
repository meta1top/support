import { createZodDto } from "nestjs-zod";

import { PresignedDownloadUrlRequestSchema, PresignedDownloadUrlResponseSchema } from "../schemas";

/**
 * 预签名下载 URL 请求参数
 */
export class PresignedDownloadUrlRequest extends createZodDto(PresignedDownloadUrlRequestSchema) {}

/**
 * 预签名下载 URL 响应
 */
export class PresignedDownloadUrlResponse extends createZodDto(PresignedDownloadUrlResponseSchema) {}
