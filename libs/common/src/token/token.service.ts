import { Injectable, Logger } from "@nestjs/common";
import * as jwt from "jsonwebtoken";

import { AppError, ErrorCode } from "../errors";
import type { CreateTokenData, TokenConfig, TokenPayload } from "./token.types";

/**
 * JWT Token 服务
 * 提供 Token 的创建、验证和解析功能
 *
 * @example
 * ```typescript
 * @Module({
 *   providers: [
 *     {
 *       provide: TokenService,
 *       useFactory: () => new TokenService({
 *         secret: 'your-secret-key',
 *         defaultExpiresIn: 7 * 24 * 60 * 60 * 1000, // 7 days
 *       }),
 *     },
 *   ],
 * })
 * export class AppModule {}
 * ```
 */
@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);
  private readonly config: Required<TokenConfig>;

  constructor(config: TokenConfig) {
    this.config = {
      secret: config.secret,
      defaultExpiresIn: config.defaultExpiresIn ?? 7 * 24 * 60 * 60 * 1000, // 默认 7 天
    };

    if (!this.config.secret) {
      throw new AppError(ErrorCode.TOKEN_SECRET_REQUIRED);
    }
  }

  /**
   * 创建 JWT Token
   * @param data Token 数据
   * @returns JWT Token 字符串
   *
   * @example
   * ```typescript
   * const token = tokenService.create({
   *   id: '123',
   *   username: 'john',
   *   expiresIn: 7 * 24 * 60 * 60 * 1000, // 7 days
   * });
   * ```
   */
  create(data: CreateTokenData): string {
    const now = Date.now();
    const expiresIn = data.expiresIn || this.config.defaultExpiresIn;

    try {
      const payload: Record<string, unknown> = {
        ...data,
        id: undefined, // 移除 id，使用 jti
        username: undefined, // 移除 username，使用 sub
        expiresIn: undefined, // 移除 expiresIn
      };

      // 清理 undefined 字段
      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });

      const token = jwt.sign(payload, this.config.secret, {
        jwtid: String(data.id),
        subject: data.username,
        expiresIn: Math.floor(expiresIn / 1000), // 转换为秒
      });

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
      jwt.verify(token, this.config.secret);
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
   * @returns Token Payload，解析失败返回 null
   *
   * @example
   * ```typescript
   * const payload = tokenService.parse('eyJhbGc...');
   * if (payload) {
   *   console.log('User ID:', payload.jti);
   *   console.log('Username:', payload.sub);
   * }
   * ```
   */
  parse(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.config.secret);

      if (typeof decoded === "string") {
        this.logger.warn("Unexpected token format: string payload");
        return null;
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
   * @param expiresIn 新的过期时间（毫秒），不传则使用默认值
   * @returns 新的 Token
   */
  refresh(token: string, expiresIn?: number): string {
    const payload = this.parse(token);
    if (!payload) {
      throw new AppError(ErrorCode.TOKEN_INVALID);
    }

    // 提取自定义字段
    const customData: Record<string, unknown> = { ...payload };
    delete customData.jti;
    delete customData.sub;
    delete customData.iat;
    delete customData.exp;
    delete customData.nbf;
    delete customData.aud;
    delete customData.iss;

    return this.create({
      id: payload.jti,
      username: payload.sub,
      expiresIn: expiresIn || this.config.defaultExpiresIn,
      ...customData,
    });
  }
}
