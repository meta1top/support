import { createHmac, randomBytes } from "node:crypto";
import { Injectable, Logger } from "@nestjs/common";
import { InjectRedis } from "@nestjs-modules/ioredis";
import Redis from "ioredis";
import ms from "ms";

import { SecurityConfigService } from "../config/security.config.service";
import type { OTPConfig, SecurityConfig } from "../shared";

/**
 * Base32编码表
 */
const BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/**
 * Base32编码
 */
function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = "";

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      output += BASE32_CHARS[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_CHARS[(value << (5 - bits)) & 31];
  }

  return output;
}

/**
 * Base32解码
 */
function base32Decode(encoded: string): Buffer {
  const cleanedInput = encoded.toUpperCase().replace(/=+$/, "");
  let bits = 0;
  let value = 0;
  let index = 0;
  const output = Buffer.alloc((cleanedInput.length * 5) / 8);

  for (let i = 0; i < cleanedInput.length; i++) {
    const idx = BASE32_CHARS.indexOf(cleanedInput[i]);
    if (idx === -1) {
      throw new Error(`Invalid character in base32 string: ${cleanedInput[i]}`);
    }

    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      output[index++] = (value >>> (bits - 8)) & 255;
      bits -= 8;
    }
  }

  return output.subarray(0, index);
}

/**
 * OTP服务
 * 基于TOTP算法实现的一次性密码服务
 */
@Injectable()
export class OTPService {
  private readonly logger = new Logger(OTPService.name);

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly securityConfigService: SecurityConfigService,
  ) {}

  /**
   * 获取OTP配置，并应用默认值
   */
  private get config(): Required<OTPConfig> {
    const securityConfig = this.securityConfigService.get<SecurityConfig>();
    const otpConfig = securityConfig.otp;

    // 应用默认值（与Java版本保持一致）
    return {
      debug: otpConfig.debug,
      code: otpConfig.code,
      expiresIn: otpConfig.expiresIn,
      issuer: otpConfig.issuer,
      secretSize: otpConfig.secretSize ?? 32,
      randomNumberAlgorithm: otpConfig.randomNumberAlgorithm ?? "SHA1PRNG",
      windowSize: otpConfig.windowSize ?? 1,
      secondPerSize: otpConfig.secondPerSize ?? 30,
    };
  }

  /**
   * 生成一个SecretKey，外部绑定到用户
   *
   * @returns SecretKey
   */
  generateSecretKey(): string {
    try {
      const seed = this.getSeed();
      const buffer = randomBytes(this.config.secretSize);

      // 使用种子混合随机字节（模拟Java的setSeed）
      for (let i = 0; i < buffer.length && i < seed.length; i++) {
        buffer[i] = buffer[i] ^ seed[i % seed.length];
      }

      // Base32编码
      const encoded = base32Encode(buffer);
      // 移除末尾的等号
      return encoded.replace(/=+$/, "");
    } catch (error) {
      throw new Error(`生成密钥失败: ${error}`);
    }
  }

  /**
   * 生成二维码所需的字符串
   * 注：这个format不可修改，否则会导致身份验证器无法识别二维码
   *
   * @param user - 绑定到的用户名
   * @param secret - 对应的secretKey
   * @returns 二维码字符串
   */
  getQRCode(user: string, secret: string): string {
    const issuer = this.config.issuer;

    if (issuer?.includes(":")) {
      throw new Error("Issuer不能包含':'字符");
    }

    let formattedUser = user;
    if (issuer) {
      formattedUser = `${issuer}:${user}`;
    }

    let qrCode = `otpauth://totp/${formattedUser}?secret=${secret}`;

    if (issuer) {
      qrCode += `&issuer=${issuer}`;
    }

    return qrCode;
  }

  /**
   * 生成OTP密钥并缓存到Redis
   * 用于用户启用MFA时获取密钥和二维码
   *
   * @param username - 用户名
   * @returns 密钥
   */
  async getSecretKey(username: string) {
    // 生成密钥
    const secret = this.generateSecretKey();

    // 缓存密钥到Redis，过期时间从配置获取（默认5分钟）
    const cacheKey = `otp:secret:${username}`;
    const expiresInMs = ms(this.config.expiresIn);
    const expiresInSeconds = Math.floor(expiresInMs / 1000);

    await this.redis.setex(cacheKey, expiresInSeconds, secret);

    this.logger.log(`OTP密钥已生成并缓存: username=${username}, expiresIn=${expiresInSeconds}s`);

    return secret;
  }

  async getCachedSecretKey(username: string): Promise<string | null> {
    const cacheKey = `otp:secret:${username}`;
    const secret = await this.redis.get(cacheKey);
    return secret;
  }

  /**
   * 从Redis获取缓存的密钥
   * 用于验证用户在启用MFA时输入的验证码
   *
   * @param username - 用户名
   * @returns 缓存的密钥，如果不存在或已过期返回null
   */
  async getCachedSecret(username: string): Promise<string | null> {
    const cacheKey = `otp:secret:${username}`;
    const secret = await this.redis.get(cacheKey);
    return secret;
  }

  /**
   * 删除Redis中缓存的密钥
   * 用于用户取消启用MFA或已成功启用后清理缓存
   *
   * @param username - 用户名
   */
  async deleteCachedSecret(username: string): Promise<void> {
    const cacheKey = `otp:secret:${username}`;
    await this.redis.del(cacheKey);
    this.logger.log(`OTP缓存密钥已删除: username=${username}`);
  }

  /**
   * 验证用户提交的code是否匹配
   *
   * @param secret - 用户绑定的secretKey
   * @param code - 用户输入的code
   * @returns 匹配成功与否
   */
  check(secret: string, code: string): boolean {
    // 调试模式：直接比对配置中的固定code
    if (this.config.debug) {
      const isValid = parseInt(code, 10) === this.config.code;
      this.logger.warn(`[调试模式] OTP验证: code=${code}, expected=${this.config.code}, result=${isValid}`);
      return isValid;
    }

    try {
      // Base32解码
      const decodedKey = base32Decode(secret);

      // 将unix毫秒时间转换为30秒的"窗口"
      // 这符合TOTP规范（详见RFC）
      const timeMsec = Date.now();
      const t = Math.floor(timeMsec / 1000 / this.config.secondPerSize);

      // 窗口用于检查最近生成的代码
      // 可以使用这个值来调整愿意回溯多远
      for (let i = 0; i <= this.config.windowSize; i++) {
        try {
          const hash = this.verify(decodedKey, t + i);
          this.logger.error(`input code=${code}; count hash=${hash}`);

          if (parseInt(code, 10) === hash) {
            return true;
          }
        } catch (error) {
          throw new Error(`验证失败: ${error}`);
        }
      }

      // 验证码无效
      return false;
    } catch (error) {
      this.logger.error(`OTP验证异常: ${error}`);
      return false;
    }
  }

  /**
   * 内部验证方法
   *
   * @param key - 解码后的密钥
   * @param t - 时间窗口
   * @returns 计算出的hash值
   */
  private verify(key: Buffer, t: number): number {
    // 创建8字节的数据buffer
    const data = Buffer.alloc(8);
    let value = t;

    // 将时间值转换为字节数组（大端序）
    for (let i = 7; i >= 0; i--) {
      data[i] = value & 0xff;
      value = Math.floor(value / 256);
    }

    // 使用HmacSHA1计算hash
    const hmac = createHmac("sha1", key);
    hmac.update(data);
    const hash = hmac.digest();

    // 动态截断
    const offset = hash[hash.length - 1] & 0x0f;

    // 提取4字节并转换为整数
    let truncatedHash = 0;
    for (let i = 0; i < 4; i++) {
      truncatedHash = (truncatedHash << 8) | (hash[offset + i] & 0xff);
    }

    // 去掉符号位并取模
    truncatedHash = truncatedHash & 0x7fffffff;
    truncatedHash = truncatedHash % 1000000;

    return truncatedHash;
  }

  /**
   * 生成种子
   *
   * @returns 种子字节数组
   */
  private getSeed(): Buffer {
    const issuer = this.config.issuer;
    const timestamp = Date.now().toString();
    const seedString = `${issuer}${timestamp}${issuer}`;
    return Buffer.from(seedString, "utf-8");
  }
}
