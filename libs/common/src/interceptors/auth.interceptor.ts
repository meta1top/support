import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from "@nestjs/common";
import type { Request } from "express";
import { Observable } from "rxjs";

import { SessionService } from "../session";
import type { SessionUser } from "../session/session.types";

/**
 * 认证拦截器
 * 从请求头中提取 token 并获取 SessionUser，存储到 request.user 中
 *
 * @example
 * ```typescript
 * @Module({
 *   providers: [
 *     {
 *       provide: APP_INTERCEPTOR,
 *       useClass: AuthInterceptor,
 *     },
 *   ],
 * })
 * export class AppModule {}
 * ```
 */
@Injectable()
export class AuthInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuthInterceptor.name);

  constructor(private readonly sessionService: SessionService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest<Request & { user?: SessionUser }>();

    // 从 Authorization header 中提取 token
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const tokenHash = authHeader.substring(7); // 移除 "Bearer " 前缀

      try {
        // 获取会话用户信息
        const user = await this.sessionService.get(tokenHash);
        if (user) {
          // 将用户信息存储到 request.user 中
          request.user = user;
          this.logger.debug(`User authenticated: ${user.username}`);
        } else {
          this.logger.debug("Invalid or expired token");
        }
      } catch (error) {
        this.logger.error("Failed to authenticate user", error);
      }
    }

    return next.handle();
  }
}
