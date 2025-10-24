import { Injectable, Logger } from "@nestjs/common";
import { InjectRedis } from "@nestjs-modules/ioredis";
import type { Redis } from "ioredis";
import ms from "ms";

import { md5 } from "../common.utils";
import { TokenService } from "../token";
import type { SessionUser } from "./session.types";

/**
 * 会话管理服务
 * 提供用户登录、登出和会话查询功能
 * 使用 Redis 存储会话信息，类似 Spring Boot 的 SessionService
 */
@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly tokenService: TokenService,
  ) {}

  /**
   * 用户登录
   * 将用户信息存储到 Redis 中
   * @param user 用户会话信息
   * @returns MD5 后的 token（用于客户端后续请求）
   */
  async login(user: SessionUser): Promise<string> {
    // login 时 user.jwtToken 是原始 token，需要 MD5
    const tokenHash = md5(user.jwtToken);
    const tokenKey = this.buildTokenKeyFromHash(tokenHash);
    const sessionKey = this.buildSessionKey(user.username);
    const ttlSeconds = Math.floor(ms(user.expiresIn) / 1000);

    try {
      // 存储会话数据和 token 映射
      await Promise.all([
        this.redis.setex(sessionKey, ttlSeconds, JSON.stringify(user)),
        this.redis.setex(tokenKey, ttlSeconds, user.jwtToken),
      ]);

      this.logger.log(`User logged in: ${user.username}, expires in ${ttlSeconds}s`);
      return tokenHash;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      this.logger.error(`Failed to save session for user ${user.username}: ${errorMessage}`, error);
      throw error;
    }
  }

  /**
   * 用户登出
   * 从 Redis 中删除会话信息
   * @param tokenHash MD5 后的 token
   */
  async logout(tokenHash: string): Promise<void> {
    try {
      const user = await this.get(tokenHash);
      if (!user) {
        this.logger.debug(`No session found for token: ${this.maskToken(tokenHash)}`);
        return;
      }

      const tokenKey = this.buildTokenKeyFromHash(tokenHash);
      const sessionKey = this.buildSessionKey(user.username);

      await Promise.all([this.redis.del(tokenKey), this.redis.del(sessionKey)]);

      this.logger.log(`User logged out: ${user.username}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      this.logger.error(`Failed to logout: ${errorMessage}`, error);
      throw error;
    }
  }

  /**
   * 获取会话信息
   * @param tokenHash MD5 后的 token
   * @returns 用户会话信息，不存在或过期返回 null
   */
  async get(tokenHash: string): Promise<SessionUser | null> {
    try {
      // 1. 从 token key 获取 JWT token
      const tokenKey = this.buildTokenKeyFromHash(tokenHash);
      const jwtToken = await this.redis.get(tokenKey);

      if (!jwtToken) {
        this.logger.debug(`Token not found in Redis: ${this.maskToken(tokenHash)}`);
        return null;
      }

      // 2. 验证 JWT token
      try {
        const payload = this.tokenService.parse(jwtToken);
        const username = payload.sub;

        // 3. 从 session key 获取用户信息
        const sessionKey = this.buildSessionKey(username);
        const sessionData = await this.redis.get(sessionKey);

        if (!sessionData) {
          this.logger.warn(`Session not found for user: ${username}`);
          return null;
        }

        const user = JSON.parse(sessionData) as SessionUser;
        return user;
      } catch (error) {
        // Token 无效或已过期
        this.logger.debug(`Invalid or expired token: ${error instanceof Error ? error.message : "Unknown error"}`);
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      this.logger.error(`Failed to get session: ${errorMessage}`, error);
      return null;
    }
  }

  /**
   * 刷新会话过期时间
   * @param tokenHash MD5 后的 token
   * @param expiresIn 新的过期时间（毫秒）
   */
  async refresh(tokenHash: string, expiresIn: number): Promise<boolean> {
    try {
      const user = await this.get(tokenHash);
      if (!user) {
        return false;
      }

      const ttlSeconds = Math.floor(expiresIn / 1000);
      const tokenKey = this.buildTokenKeyFromHash(tokenHash);
      const sessionKey = this.buildSessionKey(user.username);

      // 更新过期时间
      await Promise.all([this.redis.expire(tokenKey, ttlSeconds), this.redis.expire(sessionKey, ttlSeconds)]);

      this.logger.log(`Session refreshed for user: ${user.username}, new TTL: ${ttlSeconds}s`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      this.logger.error(`Failed to refresh session: ${errorMessage}`, error);
      return false;
    }
  }

  /**
   * 检查会话是否存在
   * @param tokenHash MD5 后的 token
   */
  async exists(tokenHash: string): Promise<boolean> {
    try {
      const tokenKey = this.buildTokenKeyFromHash(tokenHash);
      const exists = await this.redis.exists(tokenKey);
      return exists === 1;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      this.logger.error(`Failed to check session existence: ${errorMessage}`, error);
      return false;
    }
  }

  /**
   * 构建 Token Redis Key（从 MD5 hash）
   * @param tokenHash MD5 后的 token
   */
  private buildTokenKeyFromHash(tokenHash: string): string {
    return `session:token:${tokenHash}`;
  }

  /**
   * 构建 Session Redis Key
   * @param username 用户名
   */
  private buildSessionKey(username: string): string {
    return `session:user:${username}`;
  }

  /**
   * 遮罩 Token（用于日志）
   * @param token JWT Token
   */
  private maskToken(token: string): string {
    if (token.length <= 10) {
      return "***";
    }
    return `${token.substring(0, 8)}...${token.substring(token.length - 4)}`;
  }
}
