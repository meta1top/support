/**
 * JWT Token 服务类型定义
 */

/**
 * 创建 Token 的数据
 */
export interface CreateTokenData {
  /** 用户 ID */
  id: string | number;
  /** 用户名 */
  username: string;
  /** 过期时间（毫秒） */
  expiresIn: number;
  /** 额外的自定义数据 */
  [key: string]: unknown;
}

/**
 * Token 配置
 */
export interface TokenConfig {
  /** JWT 密钥 */
  secret: string;
  /** 默认过期时间（毫秒），默认 7 天 */
  defaultExpiresIn?: number;
}

/**
 * Token Payload（解析后的数据）
 */
export interface TokenPayload {
  /** JWT ID */
  jti: string;
  /** 用户名 */
  sub: string;
  /** 签发时间（秒级时间戳） */
  iat: number;
  /** 过期时间（秒级时间戳） */
  exp: number;
  /** 额外的自定义数据 */
  [key: string]: unknown;
}
