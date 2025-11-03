import { createZodDto } from "nestjs-zod";

import { PresignedUploadUrlRequestSchema, PresignedUploadUrlResponseSchema } from "../schemas";

/**
 * 预签名上传 URL 请求参数
 */
export class PresignedUploadUrlRequest extends createZodDto(PresignedUploadUrlRequestSchema) {}

/**
 * 预签名上传 URL 响应
 */
export class PresignedUploadUrlResponse extends createZodDto(PresignedUploadUrlResponseSchema) {}
