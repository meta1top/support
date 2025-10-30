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

  // 配置相关错误 (300-399)
  CONFIG_NOT_FOUND: { code: 300, message: "Config not found" },
} as const;

export type AppErrorCode = {
  code: number;
  message: string;
};
