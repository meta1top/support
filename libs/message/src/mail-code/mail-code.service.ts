import { Injectable, Logger } from "@nestjs/common";
import { InjectRedis } from "@nestjs-modules/ioredis";
import Redis from "ioredis";

import { AppError } from "@meta-1/nest-common";
import { MessageConfigService } from "../config/message.config.service";
import { MailService } from "../mail";
import { ErrorCode } from "../shared";
import { SendCodeDto } from "./mail-code.dto";

@Injectable()
export class MailCodeService {
  private readonly logger = new Logger(MailCodeService.name);

  constructor(
    private readonly messageConfigService: MessageConfigService,
    @InjectRedis() private readonly redis: Redis,
    private readonly mailService: MailService,
  ) {}

  /**
   * 发送验证码
   * @param options 发送选项
   * @throws AppError 发送失败时抛出
   */
  async send(options: SendCodeDto): Promise<void> {
    const { email, action } = options;
    const config = this.messageConfigService.get();
    // 1. 生成或使用固定验证码
    const code = this.generateCode();

    if (config?.debug) {
      this.logger.debug(`[DEBUG] Code: ${code}, Recipient: ${email}, Action: ${action}`);
      return;
    }

    // 2. 检查发送频率限制（1分钟内不可重复发送）
    const rateLimitKey = this.buildRateLimitKey(email, action);
    try {
      const lastSendTime = await this.redis.get(rateLimitKey);
      if (lastSendTime) {
        this.logger.warn(`Verification code send too frequently: ${email}, action: ${action}`);
        throw new AppError(ErrorCode.VERIFICATION_CODE_SEND_TOO_FREQUENTLY);
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      this.logger.error(`Redis rate limit check failed: ${errorMessage}`, error);
      // 频率检查失败不阻止发送，继续执行
    }

    // 3. 生产模式：存储到 Redis
    const redisKey = this.buildRedisKey(email, action);

    try {
      await this.redis.setex(redisKey, 300, code); // 5分钟 = 300秒
      this.logger.log(`Verification code stored in Redis: ${redisKey}, expiry: 5 minutes`);

      // 设置频率限制标记（1分钟 = 60秒）
      await this.redis.setex(rateLimitKey, 60, Date.now().toString());
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      this.logger.error(`Redis storage failed: ${errorMessage}`, error);
      throw new AppError(ErrorCode.VERIFICATION_CODE_STORAGE_FAILED);
    }

    // 4. 发送邮件
    try {
      const emailResult = await this.mailService.sendVerificationCode(email, code, 5);

      if (!emailResult.success) {
        // 发送失败，删除 Redis 中的验证码
        await this.redis.del(redisKey);
        this.logger.error(`Email sending failed, deleted verification code from Redis: ${redisKey}`);
        throw new AppError(ErrorCode.EMAIL_SENDING_FAILED, emailResult.error);
      }

      this.logger.log(
        `Verification code email sent successfully, recipient: ${email}, MessageId: ${emailResult.messageId}`,
      );
    } catch (error) {
      // 清理 Redis
      await this.redis.del(redisKey);

      if (error instanceof AppError) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      this.logger.error(`Failed to send verification code: ${errorMessage}`, error);
      throw new AppError(ErrorCode.VERIFICATION_CODE_SEND_FAILED);
    }
  }

  /**
   * 验证验证码
   * @param to 邮箱地址
   * @param action 操作类型
   * @param code 验证码
   * @returns 验证是否成功
   */
  async verify(to: string, action: string, code: string): Promise<boolean> {
    const config = this.messageConfigService.get();
    if (config.debug) {
      const isValid = `${code}` === this.generateCode();
      this.logger.debug(`[DEBUG] Verification: ${isValid ? "✅ Passed" : "❌ Failed"}, input: ${code}`);
      return isValid;
    }

    // 生产模式：从 Redis 验证
    const redisKey = this.buildRedisKey(to, action);

    let storedCode: string | null;
    try {
      storedCode = await this.redis.get(redisKey);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      this.logger.error(`Redis read failed: ${errorMessage}`, error);
      return false;
    }

    if (!storedCode) {
      this.logger.warn(`Verification code does not exist or has expired: ${redisKey}`);
      return false;
    }

    const isValid = storedCode === code;

    if (isValid) {
      // 验证成功，删除验证码（一次性使用）
      try {
        await this.redis.del(redisKey);
        this.logger.log(`Verification code verified successfully, deleted: ${redisKey}`);
      } catch (error) {
        this.logger.error(`Failed to delete verification code: ${error}`, error);
        // 删除失败不影响验证结果，只记录日志
      }
    } else {
      this.logger.warn(`Verification code incorrect: ${redisKey}, input: ${code}, expected: ${storedCode}`);
    }

    return isValid;
  }

  /**
   * 生成验证码
   * @returns 6位数字验证码
   */
  private generateCode(): string {
    const config = this.messageConfigService.get();
    if (config.debug && config.code) {
      return `${config.code}`;
    }

    // 生成6位随机数字
    return `${Math.floor(100000 + Math.random() * 900000).toString()}`;
  }

  /**
   * 构建 Redis Key
   * @param to 邮箱地址
   * @param action 操作类型
   * @returns Redis Key
   */
  private buildRedisKey(to: string, action: string): string {
    return `mail:code:${action}:${to}`;
  }

  /**
   * 构建频率限制 Redis Key
   * @param to 邮箱地址
   * @param action 操作类型
   * @returns Redis Key
   */
  private buildRateLimitKey(to: string, action: string): string {
    return `mail:code:ratelimit:${action}:${to}`;
  }
}
