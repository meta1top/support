import { Inject, Injectable, Logger } from "@nestjs/common";
import { InjectRedis } from "@nestjs-modules/ioredis";
import Redis from "ioredis";

import { AppError } from "@meta-1/nest-common";
import { MailService } from "./mail.service";
import { SendCodeDto } from "./mail-code.dto";
import { MESSAGE_CONFIG } from "./message.consts";
import type { MessageConfig } from "./message.types";

@Injectable()
export class MailCodeService {
  private readonly logger = new Logger(MailCodeService.name);
  private readonly debug: boolean;
  private readonly fixedCode?: string;

  constructor(
    @Inject(MESSAGE_CONFIG) config: MessageConfig,
    @InjectRedis() private readonly redis: Redis,
    private readonly mailService: MailService,
  ) {
    this.debug = config.debug || false;
    this.fixedCode = config.code;

    if (this.debug) {
      this.logger.warn(
        `⚠️  验证码服务运行在 DEBUG 模式，验证码不会真实发送${this.fixedCode ? `，固定验证码: ${this.fixedCode}` : ""}`,
      );
    }
  }

  /**
   * 发送验证码
   * @param options 发送选项
   * @throws AppError 发送失败时抛出
   */
  async send(options: SendCodeDto): Promise<void> {
    const { email, action } = options;

    // 1. 生成或使用固定验证码
    const code = this.generateCode();

    // 2. DEBUG 模式：不存储，不发送
    if (this.debug) {
      this.logger.debug(`[DEBUG] 验证码: ${code}，收件人: ${email}，操作: ${action}`);
      return;
    }

    // 3. 生产模式：存储到 Redis
    const redisKey = this.buildRedisKey(email, action);

    try {
      await this.redis.setex(redisKey, 300, code); // 5分钟 = 300秒
      this.logger.log(`验证码已存储到 Redis: ${redisKey}，过期时间: 5分钟`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "未知错误";
      this.logger.error(`Redis 存储失败: ${errorMessage}`, error);
      throw new AppError(500, "验证码存储失败");
    }

    // 4. 发送邮件
    try {
      const emailResult = await this.mailService.sendVerificationCode(email, code, 5);

      if (!emailResult.success) {
        // 发送失败，删除 Redis 中的验证码
        await this.redis.del(redisKey);
        this.logger.error(`邮件发送失败，已删除 Redis 中的验证码: ${redisKey}`);
        throw new AppError(500, emailResult.error || "邮件发送失败");
      }

      this.logger.log(`验证码邮件发送成功，收件人: ${email}，MessageId: ${emailResult.messageId}`);
    } catch (error) {
      // 清理 Redis
      await this.redis.del(redisKey);

      if (error instanceof AppError) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : "未知错误";
      this.logger.error(`发送验证码失败: ${errorMessage}`, error);
      throw new AppError(500, "发送验证码失败");
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
    // DEBUG 模式：使用固定验证码验证
    if (this.debug) {
      const isValid = code === this.generateCode();
      this.logger.debug(`[DEBUG] 验证码验证: ${isValid ? "✅ 通过" : "❌ 失败"}，输入: ${code}`);
      return isValid;
    }

    // 生产模式：从 Redis 验证
    const redisKey = this.buildRedisKey(to, action);

    let storedCode: string | null;
    try {
      storedCode = await this.redis.get(redisKey);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "未知错误";
      this.logger.error(`Redis 读取失败: ${errorMessage}`, error);
      return false;
    }

    if (!storedCode) {
      this.logger.warn(`验证码不存在或已过期: ${redisKey}`);
      return false;
    }

    const isValid = storedCode === code;

    if (isValid) {
      // 验证成功，删除验证码（一次性使用）
      try {
        await this.redis.del(redisKey);
        this.logger.log(`验证码验证成功，已删除: ${redisKey}`);
      } catch (error) {
        this.logger.error(`删除验证码失败: ${error}`, error);
        // 删除失败不影响验证结果，只记录日志
      }
    } else {
      this.logger.warn(`验证码错误: ${redisKey}，输入: ${code}，期望: ${storedCode}`);
    }

    return isValid;
  }

  /**
   * 生成验证码
   * @returns 6位数字验证码
   */
  private generateCode(): string {
    // DEBUG 模式且配置了固定验证码，使用固定验证码
    if (this.debug && this.fixedCode) {
      return this.fixedCode;
    }

    // 生成6位随机数字
    return Math.floor(100000 + Math.random() * 900000).toString();
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
}
