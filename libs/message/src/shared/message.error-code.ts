import type { AppErrorCode } from "@meta-1/nest-common";

/**
 * Message 模块错误码定义
 * 每个错误码包含 code 和 message 两个字段
 *
 * 错误码范围：1000-1999
 */
export const ErrorCode: Record<string, AppErrorCode> = {
  // 验证码相关错误 (1000-1099)
  VERIFICATION_CODE_STORAGE_FAILED: { code: 1000, message: "Verification code storage failed" },
  EMAIL_SENDING_FAILED: { code: 1001, message: "Email sending failed" },
  VERIFICATION_CODE_SEND_FAILED: { code: 1002, message: "Failed to send verification code" },
  VERIFICATION_CODE_EXPIRED: { code: 1003, message: "Verification code expired or does not exist" },
  VERIFICATION_CODE_INCORRECT: { code: 1004, message: "Verification code incorrect" },
  VERIFICATION_CODE_SEND_TOO_FREQUENTLY: {
    code: 1005,
    message: "Verification code sent too frequently, please try again later",
  },

  // 邮件服务错误 (1100-1199)
  MAIL_SERVICE_NOT_CONFIGURED: { code: 1100, message: "Mail service not configured correctly" },
  MAIL_CONTENT_EMPTY: { code: 1101, message: "Email content cannot be empty" },

  CONFIG_NOT_FOUND: { code: 1200, message: "Config not found" },
};
