import { SetMetadata } from "@nestjs/common";

/**
 * Public 元数据键
 */
export const IS_PUBLIC_KEY = "isPublic";

/**
 * Public 装饰器
 * 标记 Controller 方法为公开访问，跳过鉴权
 *
 * @example
 * ```typescript
 * @Controller('auth')
 * export class AuthController {
 *   @Public()
 *   @Post('login')
 *   async login(@Body() loginDto: LoginDto) {
 *     // 不需要鉴权，任何人都可以访问
 *     return await this.authService.login(loginDto);
 *   }
 *
 *   @Post('logout')
 *   async logout(@CurrentUser() user: SessionUser) {
 *     // 需要鉴权（没有 @Public 装饰器）
 *     return await this.authService.logout(user);
 *   }
 * }
 * ```
 *
 * 在 Guard 中使用：
 * ```typescript
 * @Injectable()
 * export class AuthGuard implements CanActivate {
 *   constructor(private reflector: Reflector) {}
 *
 *   canActivate(context: ExecutionContext): boolean {
 *     // 检查是否有 @Public 装饰器
 *     const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
 *       context.getHandler(),
 *       context.getClass(),
 *     ]);
 *
 *     if (isPublic) {
 *       return true; // 跳过鉴权
 *     }
 *
 *     // 执行鉴权逻辑...
 *     return this.validateRequest(context);
 *   }
 * }
 * ```
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
