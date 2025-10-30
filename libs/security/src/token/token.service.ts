import { Injectable, Logger } from "@nestjs/common";
import * as jwt from "jsonwebtoken";
import ms from "ms";

import { AppError } from "@meta-1/nest-common";
import { SecurityConfigService } from "../config";
import { ErrorCode } from "../shared";
import type { CreateTokenData, TokenPayload } from "./token.types";

/**
 * JWT Token 服务
 * 提供 Token 的创建、验证和解析功能
 * ```
 */
@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(private readonly securityConfigService: SecurityConfigService) {}

  /**
   * 创建 JWT Token
   * @param data Token 数据
   * @returns JWT Token 字符串
   */
  create(data: CreateTokenData): string {
    const config = this.securityConfigService.get();
    if (!config?.jwt.secret) {
      throw new AppError(ErrorCode.TOKEN_SECRET_REQUIRED);
    }
    const expiresIn = (data.expiresIn || config?.jwt.expiresIn) ?? "1d";

    try {
      const token = jwt.sign(
        {
          sub: data.username,
          jti: data.id,
        },
        config?.jwt.secret,
        {
          algorithm: "HS256",
          expiresIn,
        },
      );

      return token;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      this.logger.error(`Token creation failed: ${errorMessage}`, error);
      throw new AppError(ErrorCode.TOKEN_CREATE_ERROR);
    }
  }

  /**
   * 验证 Token 是否有效
   * @param token JWT Token 字符串
   * @returns 是否有效
   *
   * @example
   * ```typescript
   * const isValid = tokenService.check('eyJhbGc...');
   * if (isValid) {
   *   console.log('Token is valid');
   * }
   * ```
   */
  check(token: string): boolean {
    try {
      const config = this.securityConfigService.get();
      if (!config?.jwt.secret) {
        throw new AppError(ErrorCode.TOKEN_SECRET_REQUIRED);
      }
      jwt.verify(token, config.jwt.secret);
      return true;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        this.logger.debug("Token expired");
      } else if (error instanceof jwt.JsonWebTokenError) {
        this.logger.debug(`Token verification failed: ${error.message}`);
      } else {
        this.logger.error("Token verification error", error);
      }
      return false;
    }
  }

  /**
   * 解析 Token 并返回 Payload
   * @param token JWT Token 字符串
   * @returns Token Payload
   * @throws {AppError} TOKEN_EXPIRED - Token 已过期
   * @throws {AppError} TOKEN_INVALID - Token 无效
   * @throws {AppError} TOKEN_PARSE_ERROR - 解析错误
   *
   * @example
   * ```typescript
   * try {
   *   const payload = tokenService.parse('eyJhbGc...');
   *   console.log('User ID:', payload.jti);
   *   console.log('Username:', payload.sub);
   * } catch (error) {
   *   console.error('Token parse failed:', error);
   * }
   * ```
   */
  parse(token: string): TokenPayload {
    try {
      const config = this.securityConfigService.get();
      if (!config?.jwt.secret) {
        throw new AppError(ErrorCode.TOKEN_SECRET_REQUIRED);
      }
      const decoded = jwt.verify(token, config.jwt.secret);

      if (typeof decoded === "string") {
        this.logger.warn("Unexpected token format: string payload");
        throw new AppError(ErrorCode.TOKEN_INVALID);
      }

      return decoded as TokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        this.logger.debug("Token expired");
        throw new AppError(ErrorCode.TOKEN_EXPIRED);
      }
      if (error instanceof jwt.JsonWebTokenError) {
        this.logger.debug(`Token parse failed: ${error.message}`);
        throw new AppError(ErrorCode.TOKEN_INVALID);
      }

      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      this.logger.error(`Token parse error: ${errorMessage}`, error);
      throw new AppError(ErrorCode.TOKEN_PARSE_ERROR);
    }
  }

  /**
   * 从 Token 中提取用户 ID（不验证 Token 有效性）
   * ⚠️ 注意：此方法不验证签名，仅用于快速提取信息
   * @param token JWT Token 字符串
   * @returns 用户 ID，失败返回 null
   */
  extractUserId(token: string): string | null {
    try {
      const decoded = jwt.decode(token);
      if (typeof decoded === "object" && decoded && "jti" in decoded) {
        return decoded.jti as string;
      }
      return null;
    } catch (error) {
      this.logger.debug("Failed to extract user ID from token", error);
      return null;
    }
  }

  /**
   * 从 Token 中提取用户名（不验证 Token 有效性）
   * ⚠️ 注意：此方法不验证签名，仅用于快速提取信息
   * @param token JWT Token 字符串
   * @returns 用户名，失败返回 null
   */
  extractUsername(token: string): string | null {
    try {
      const decoded = jwt.decode(token);
      if (typeof decoded === "object" && decoded && "sub" in decoded) {
        return decoded.sub as string;
      }
      return null;
    } catch (error) {
      this.logger.debug("Failed to extract username from token", error);
      return null;
    }
  }

  /**
   * 刷新 Token（使用旧 Token 的数据创建新 Token）
   * @param token 旧 Token
   * @param expiresIn 新的过期时间（字符串格式，如 "7d"），不传则使用默认值
   * @returns 新的 Token
   */
  refresh(token: string, expiresIn?: ms.StringValue): string {
    const config = this.securityConfigService.get();
    const payload = this.parse(token);
    return this.create({
      id: payload.jti,
      username: payload.sub,
      expiresIn: expiresIn || config?.jwt.expiresIn || "7d",
    });
  }
}
