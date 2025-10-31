import type ms from "ms";

export type JwtConfig = {
  secret: string;
  expiresIn?: ms.StringValue;
};

export type OTPConfig = {
  /** 发行者名称（必需） */
  issuer: string;
  /** 密钥大小，默认 32 */
  secretSize?: number;
  /** 随机数算法，默认 SHA1PRNG */
  randomNumberAlgorithm?: string;
  /** 窗口大小（允许的时间偏移），默认 1 */
  windowSize?: number;
  /** 每个窗口的秒数，默认 30 */
  secondPerSize?: number;
  /** 调试模式（用于开发环境跳过真实OTP验证） */
  debug: boolean;
  /** 调试模式下的固定验证码 */
  code: number;
  /** 密钥缓存过期时间，默认 5m */
  expiresIn: ms.StringValue;
};

export type SecurityConfig = {
  jwt: JwtConfig;
  otp: OTPConfig;
};
