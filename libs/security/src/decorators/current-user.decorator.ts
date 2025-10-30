import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { Request } from "express";

import { SessionUser } from "../session";

/**
 * 当前用户装饰器
 * 从 request 中获取当前登录的用户信息
 *
 * @example
 * ```typescript
 * @Controller('users')
 * export class UserController {
 *   @Get('profile')
 *   getProfile(@CurrentUser() user: SessionUser) {
 *     return user;
 *   }
 *
 *   @Get('info')
 *   getUserInfo(@CurrentUser() user: SessionUser | undefined) {
 *     if (!user) {
 *       throw new UnauthorizedException('Please login first');
 *     }
 *     return user;
 *   }
 * }
 * ```
 */
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): SessionUser | undefined => {
  const request = ctx.switchToHttp().getRequest<Request & { user?: SessionUser }>();
  return request.user;
});
