/**
 * 通用错误码定义
 * 每个错误码包含 code 和 message 两个字段
 *
 * 错误码范围：0-999
 */
export const ErrorCode = {
  // 通用错误 (0-999)
  SERVER_ERROR: { code: 500, message: "Server Error" },
  VALIDATION_FAILED: { code: 400, message: "Validation Failed" },
  UNAUTHORIZED: { code: 401, message: "Unauthorized" },
  FORBIDDEN: { code: 403, message: "Forbidden" },
  NOT_FOUND: { code: 404, message: "Not Found" },
  I18N_CONTEXT_NOT_FOUND: { code: 500, message: "I18nContext not found. Make sure I18nModule is properly configured." },

  // 加密相关错误 (100-199)
  DECRYPT_ERROR: { code: 100, message: "Decrypt error" },
  AES_ENCRYPT_ERROR: { code: 101, message: "AES encrypt error" },

  // Token 相关错误 (200-299)
  TOKEN_SECRET_REQUIRED: { code: 200, message: "Token secret is required" },
  TOKEN_CREATE_ERROR: { code: 201, message: "Token creation failed" },
  TOKEN_EXPIRED: { code: 202, message: "Token has expired" },
  TOKEN_INVALID: { code: 203, message: "Token is invalid" },
  TOKEN_PARSE_ERROR: { code: 204, message: "Token parse error" },
} as const;

export type AppErrorCode = {
  code: number;
  message: string;
};
