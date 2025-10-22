import type { AppErrorCode } from "./app.error-code";

export class AppError<T = unknown> extends Error {
  code: number;
  data: T | null;

  /**
   * 创建应用错误
   * @param errorCode 错误码对象（从 ErrorCode 或其他模块的 ErrorCode 中选择）
   * @param data 附加数据
   */
  constructor(errorCode: AppErrorCode, data?: T | null) {
    super(errorCode.message);
    this.code = errorCode.code;
    this.data = data ?? null;

    this.name = "AppError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
