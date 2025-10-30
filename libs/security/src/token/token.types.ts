import type ms from "ms";

export interface CreateTokenData {
  /** 用户 ID */
  id: string;
  /** 用户名 */
  username: string;
  /** 过期时间 */
  expiresIn?: ms.StringValue;
}

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
