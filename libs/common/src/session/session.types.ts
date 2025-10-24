import type ms from "ms";
/**
 * API 权限定义
 */
export interface SessionApi {
  /** API 路径 */
  path: string;
  /** HTTP 方法 */
  method: string;
}

/**
 * 会话用户信息
 */
export interface SessionUser {
  /** 用户 ID */
  id: string;
  /** 用户名 */
  username: string;
  /** Token 过期时间（毫秒） */
  expiresIn: ms.StringValue;
  /** JWT Token */
  jwtToken: string;
  /** 用户权限列表 */
  authorities?: string[];
  /** 用户可访问的 API 列表 */
  apis?: SessionApi[];
}
