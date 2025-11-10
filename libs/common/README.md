# @meta-1/nest-common

Common utilities and decorators for NestJS applications including caching, i18n, error handling, and more.

## ✨ Features

- 🎯 **Caching Decorators** - Spring Boot-style `@Cacheable` and `@CacheEvict` decorators with Redis support
- 🔒 **Distributed Lock** - `@WithLock` decorator for distributed locking with Redis
- 👤 **Session Service** - Redis-based session management with JWT token support
- 🔐 **Authentication** - `@Public` decorator and `AuthGuard` for route protection
- 🌍 **I18n Utilities** - Enhanced internationalization wrapper with namespace support
- ⚡ **Response Interceptor** - Unified API response formatting
- 🚨 **Error Handling** - Global error filter with custom `AppError` class
- ❄️ **Snowflake ID Generator** - Distributed unique ID generation decorator
- 🔄 **Locale Sync** - Automatic locale file synchronization with hot-reload
- 🔐 **JWT Token Service** - JWT token creation, validation, and parsing

## 📦 Installation

```bash
npm install @meta-1/nest-common
# or
pnpm add @meta-1/nest-common
# or
yarn add @meta-1/nest-common
```

### Peer Dependencies

```bash
npm install @nestjs/common @nestjs/platform-express nestjs-i18n ioredis
```

## 🚀 Usage

### 1. Caching Decorators

Spring Boot-style caching decorators with Redis support.

#### Setup

```typescript
import { CacheableInitializer } from '@meta-1/nest-common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';

@Module({
  providers: [CacheableInitializer],
})
export class AppModule {}
```

#### Usage

```typescript
import { CacheableService, Cacheable, CacheEvict } from '@meta-1/nest-common';

@CacheableService()
@Injectable()
export class UserService {
  // Cache the result for 5 minutes (300 seconds)
  @Cacheable({ key: 'user:#{0}', ttl: 300 })
  async getUserById(id: string) {
    return await this.userRepository.findOne(id);
  }

  // Use object properties in cache key
  @Cacheable({ key: 'user:#{id}:profile', ttl: 600 })
  async getUserProfile(params: { id: string; includeDetails: boolean }) {
    return await this.userRepository.findProfile(params.id, params.includeDetails);
  }

  // Evict specific cache entry
  @CacheEvict({ key: 'user:#{0}' })
  async updateUser(id: string, data: UpdateUserDto) {
    return await this.userRepository.update(id, data);
  }

  // Clear all cache entries
  @CacheEvict({ allEntries: true })
  async resetAllUsers() {
    return await this.userRepository.truncate();
  }
}
```

**Cache Key Patterns:**
- `#{0}`, `#{1}`, `#{2}` - Use positional arguments
- `#{id}`, `#{name}` - Use object properties (when first argument is an object)

### 2. Distributed Lock Decorator

基于 Redis 实现的分布式锁装饰器，确保同一时刻只有一个实例能执行被装饰的方法。适用于防止重复提交、库存扣减、订单创建等关键业务场景。

#### Setup

```typescript
import { LockInitializer } from '@meta-1/nest-common';

@Module({
  providers: [LockInitializer],
})
export class AppModule {}
```

#### Usage

```typescript
import { WithLock } from '@meta-1/nest-common';

@Injectable()
export class OrderService {
  // 基础使用：防止同一用户重复创建订单
  @WithLock({ 
    key: 'lock:order:create:#{userId}', 
    ttl: 10000,           // 锁的过期时间：10秒
    waitTimeout: 3000,    // 等待锁的超时时间：3秒
  })
  async createOrder(userId: string, items: OrderItem[]) {
    // 此方法同一时刻只能有一个实例执行
    // 同一用户的订单创建操作会被加锁
    const order = await this.orderRepository.create({
      userId,
      items,
      status: 'pending',
    });
    
    return order;
  }

  // 防止重复支付
  @WithLock({ 
    key: 'lock:payment:#{orderId}', 
    ttl: 30000,
    waitTimeout: 0,  // 不等待，立即失败
    errorMessage: '订单正在支付中，请勿重复提交'
  })
  async processPayment(orderId: string, paymentInfo: PaymentInfo) {
    // 检查订单状态
    const order = await this.orderRepository.findOne(orderId);
    if (order.status !== 'pending') {
      throw new AppError(ErrorCode.ORDER_STATUS_INVALID);
    }

    // 调用支付网关
    const result = await this.paymentGateway.pay(paymentInfo);
    
    // 更新订单状态
    await this.orderRepository.update(orderId, { status: 'paid' });
    
    return result;
  }

  // 使用对象属性作为锁键
  @WithLock({ 
    key: 'lock:inventory:#{productId}', 
    ttl: 5000 
  })
  async reduceInventory(params: { productId: string; quantity: number }) {
    const product = await this.productRepository.findOne(params.productId);
    
    if (product.inventory < params.quantity) {
      throw new AppError(ErrorCode.INSUFFICIENT_INVENTORY);
    }
    
    product.inventory -= params.quantity;
    await this.productRepository.save(product);
    
    return product;
  }
}
```

#### Configuration Options

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `key` | `string` | 必填 | 锁的键名，支持占位符 `#{0}`, `#{1}` (参数位置) 或 `#{propertyName}` (对象属性) |
| `ttl` | `number` | `30000` | 锁的过期时间（毫秒），防止死锁 |
| `waitTimeout` | `number` | `5000` | 等待锁的超时时间（毫秒），设置为 0 表示不等待 |
| `retryInterval` | `number` | `100` | 重试获取锁的间隔（毫秒） |
| `errorMessage` | `string` | `'操作正在处理中，请稍后重试'` | 获取锁失败时的错误提示 |

#### Lock Key Patterns

```typescript
// 使用参数位置
@WithLock({ key: 'lock:user:#{0}' })
async updateUser(userId: string, data: UpdateUserDto) { }

// 使用多个参数
@WithLock({ key: 'lock:transfer:#{0}:#{1}' })
async transfer(fromUserId: string, toUserId: string, amount: number) { }

// 使用对象属性
@WithLock({ key: 'lock:order:#{orderId}:#{userId}' })
async cancelOrder(params: { orderId: string; userId: string }) { }
```

#### Best Practices

1. **选择合适的 TTL**
   - TTL 应该大于方法的最大执行时间
   - 对于耗时操作，建议设置较长的 TTL（如 30-60 秒）
   - 对于快速操作，可以设置较短的 TTL（如 5-10 秒）

2. **设置合理的等待超时**
   - 对于幂等操作，可以设置较长的 `waitTimeout`，允许等待
   - 对于非幂等操作（如支付），建议设置 `waitTimeout: 0`，立即失败

3. **锁键设计原则**
   - 锁键应该能唯一标识业务场景
   - 避免不同业务使用相同的锁键
   - 推荐格式：`lock:{业务模块}:{操作}:{业务ID}`

4. **适用场景**
   - ✅ 支付处理、订单创建
   - ✅ 库存扣减、优惠券领取
   - ✅ 账户余额变动
   - ❌ 只读操作（不需要加锁）
   - ❌ 高频操作（会成为性能瓶颈）

#### Error Handling

```typescript
import { AppError, LockErrorCode } from '@meta-1/nest-common';

@Controller('orders')
export class OrderController {
  @Post()
  async createOrder(@Body() dto: CreateOrderDto) {
    try {
      return await this.orderService.createOrder(dto.userId, dto.items);
    } catch (error) {
      if (error instanceof AppError && error.code === LockErrorCode.LOCK_ACQUIRE_FAILED.code) {
        // 处理获取锁失败的情况
        return { message: '订单创建中，请稍后重试' };
      }
      throw error;
    }
  }
}
```

#### How It Works

分布式锁的实现基于 Redis 的 `SET NX PX` 原子操作：

1. **获取锁**：使用 `SET key value NX PX ttl` 命令
   - `NX`：只在键不存在时设置（确保互斥性）
   - `PX`：设置过期时间（防止死锁）

2. **释放锁**：使用 Lua 脚本验证锁的持有者
   - 只有锁的创建者才能释放锁
   - 防止误删其他实例的锁

3. **锁的生命周期**：
   - 方法执行前：尝试获取锁（支持重试）
   - 方法执行中：持有锁
   - 方法执行后：释放锁（在 `finally` 块中）
   - 异常情况：锁会在 TTL 后自动过期

### 3. Session Service

Redis-based session management service, similar to Spring Boot's SessionService. Stores user session information with JWT token support.

#### Setup

```typescript
import { SessionService } from '@meta-1/nest-common';

@Injectable()
export class AuthService {
  constructor(private readonly sessionService: SessionService) {}
}
```

#### Usage

```typescript
import { SessionService, SessionUser } from '@meta-1/nest-common';

@Injectable()
export class AuthService {
  constructor(
    private readonly sessionService: SessionService,
    private readonly tokenService: TokenService,
  ) {}

  async login(username: string, password: string): Promise<string> {
    // 1. 验证用户凭证
    const user = await this.validateUser(username, password);
    
    // 2. 创建 JWT token
    const jwtToken = this.tokenService.create({
      id: user.id.toString(),
      username: user.username,
      expiresIn: '7d',
    });

    // 3. 构建会话数据
    const sessionUser: SessionUser = {
      id: user.id,
      username: user.username,
      authorities: ['ROLE_USER', 'ROLE_ADMIN'],
      apis: [
        { path: '/api/users', method: 'GET' },
        { path: '/api/users/:id', method: 'PUT' },
      ],
      expiresIn: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      jwtToken,
    };

    // 4. 存储会话
    await this.sessionService.login(sessionUser);

    return jwtToken;
  }

  async logout(token: string): Promise<void> {
    await this.sessionService.logout(token);
  }

  async getCurrentUser(token: string): Promise<SessionUser | null> {
    return await this.sessionService.get(token);
  }

  async refreshSession(token: string): Promise<boolean> {
    const expiresIn = 7 * 24 * 60 * 60 * 1000; // 7 days
    return await this.sessionService.refresh(token, expiresIn);
  }

  async isSessionValid(token: string): Promise<boolean> {
    return await this.sessionService.exists(token);
  }
}
```

#### API Methods

- `login(user: SessionUser): Promise<string>` - 用户登录，存储会话信息，返回 MD5 后的 token
- `logout(tokenHash: string)` - 用户登出，删除会话信息
- `get(tokenHash: string)` - 获取会话信息
- `refresh(tokenHash: string, expiresIn: number)` - 刷新会话过期时间
- `exists(tokenHash: string)` - 检查会话是否存在

**注意：** 除了 `login` 方法传入原始 jwtToken，其他方法都传入 MD5 后的 token。

#### Redis Key Structure

- Token Key: `session:token:{md5(jwtToken)}`
- Session Key: `session:user:{username}`

#### 认证拦截器和装饰器

配合 `AuthInterceptor` 和 `@CurrentUser()` 装饰器使用：

```typescript
import { AuthInterceptor, CurrentUser, SessionUser } from '@meta-1/nest-common';

// 1. 注册全局拦截器
@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AuthInterceptor,
    },
  ],
})
export class AppModule {}

// 2. 在 Controller 中使用 @CurrentUser() 装饰器
@Controller('users')
export class UserController {
  @Get('profile')
  getProfile(@CurrentUser() user: SessionUser) {
    // user 可能是 undefined（未登录）
    if (!user) {
      throw new UnauthorizedException('Please login first');
    }
    return user;
  }

  @Get('info')
  async getUserInfo(@CurrentUser() user: SessionUser | undefined) {
    if (!user) {
      return { message: 'Not logged in' };
    }
    return {
      id: user.id,
      username: user.username,
      authorities: user.authorities,
    };
  }
}

// 3. 登录示例
@Controller('auth')
export class AuthController {
  constructor(
    private readonly sessionService: SessionService,
    private readonly tokenService: TokenService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    // 验证用户凭证...
    const user = await this.validateUser(loginDto);
    
    // 创建 JWT token
    const jwtToken = this.tokenService.create({
      id: user.id.toString(),
      username: user.username,
      expiresIn: '7d',
    });

    // 存储会话，返回 MD5 后的 token
    const tokenHash = await this.sessionService.login({
      id: user.id,
      username: user.username,
      authorities: ['ROLE_USER'],
      apis: [{ path: '/api/users', method: 'GET' }],
      expiresIn: '7d',
      jwtToken,
    });

    return {
      token: tokenHash, // 返回 MD5 后的 token 给客户端
      username: user.username,
    };
  }

  @Post('logout')
  async logout(@CurrentUser() user: SessionUser) {
    if (!user) {
      throw new UnauthorizedException('Not logged in');
    }
    // 从 header 中获取 token
    const token = this.request.headers.authorization?.substring(7);
    if (token) {
      await this.sessionService.logout(token);
    }
    return { message: 'Logged out successfully' };
  }
}
```

**客户端使用：**

```typescript
// 1. 登录后获取 token（已经是 MD5 后的）
const { token } = await fetch('/auth/login', {
  method: 'POST',
  body: JSON.stringify({ username, password }),
});

// 2. 后续请求携带 token
fetch('/users/profile', {
  headers: {
    'Authorization': `Bearer ${token}` // 使用 MD5 后的 token
  }
});
```

### 4. @Public 装饰器

标记不需要鉴权的公开路由，配合自定义 Guard 使用。

#### 基本用法

```typescript
import { Public } from '@meta-1/nest-common';

@Controller('auth')
export class AuthController {
  // ✅ 公开路由：标记为不需要鉴权
  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  // ❌ 受保护路由：需要登录才能访问（没有 @Public 装饰器）
  @Post('logout')
  async logout(@CurrentUser() user: SessionUser) {
    return await this.authService.logout(user);
  }
}
```

#### 类级别的 @Public

```typescript
// 整个 Controller 都是公开的
@Public()
@Controller('public')
export class PublicController {
  @Get('health')
  health() {
    return { status: 'ok' };
  }

  @Get('docs')
  docs() {
    return { version: '1.0.0' };
  }
}
```

#### 在自定义 Guard 中使用

```typescript
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY, SessionService } from '@meta-1/nest-common';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private sessionService: SessionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. 检查是否有 @Public 装饰器
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(), // 方法级别
      context.getClass(),   // 类级别
    ]);

    if (isPublic) {
      return true; // 跳过鉴权
    }

    // 2. 执行你的鉴权逻辑
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);
    
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    const user = await this.sessionService.get(token);
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    request.user = user;
    return true;
  }

  private extractToken(request: any): string | null {
    const authHeader = request.headers.authorization;
    return authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;
  }
}

// 注册全局 Guard
@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
```

#### 高级用法：权限检查

```typescript
import { SetMetadata } from '@nestjs/common';

// 定义权限装饰器
export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: string[]) => 
  SetMetadata(PERMISSIONS_KEY, permissions);

// 使用
@Controller('users')
export class UserController {
  @RequirePermissions('user:read')
  @Get()
  list() {
    return this.userService.list();
  }

  @Public() // 公开路由
  @Get('public')
  publicList() {
    return this.userService.publicList();
  }
}

// 在 Guard 中检查权限
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 检查是否是公开路由
    const isPublic = this.reflector.get<boolean>(IS_PUBLIC_KEY, context.getHandler());
    if (isPublic) return true;

    // 检查权限
    const requiredPermissions = this.reflector.get<string[]>(
      PERMISSIONS_KEY, 
      context.getHandler()
    );
    
    if (!requiredPermissions) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return requiredPermissions.every(permission => 
      user.authorities?.includes(permission)
    );
  }
}
```

### 5. I18n with Namespace Support

Enhanced i18n utilities with automatic namespace prefixing.

#### Setup

```typescript
import { I18nModule } from 'nestjs-i18n';
import * as path from 'path';

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
    }),
  ],
})
export class AppModule {}
```

#### Locale Files Structure

```
i18n/
├── en/
│   └── common.json
└── zh-CN/
    └── common.json
```

**common.json:**
```json
{
  "users": {
    "list": {
      "success": "Users retrieved successfully"
    },
    "create": {
      "success": "User created successfully"
    }
  }
}
```

#### Usage

```typescript
import { I18n, I18nContext } from '@meta-1/nest-common';

@Controller('users')
export class UserController {
  @Get()
  async getUsers(@I18n() i18n: I18nContext) {
    const users = await this.userService.findAll();
    
    return {
      message: i18n.t('users.list.success'),  // Auto-prefixed with 'common'
      data: users,
    };
  }

  @Post()
  async createUser(
    @Body() dto: CreateUserDto,
    @I18n() i18n: I18nContext
  ) {
    const user = await this.userService.create(dto);
    
    return {
      message: i18n.t('users.create.success', {
        args: { name: user.name }  // Interpolation support
      }),
      data: user,
    };
  }
}
```

**Create Custom Namespace:**

```typescript
import { I18n as NestI18n } from 'nestjs-i18n';
import { createI18nContext, RawI18nContext } from '@meta-1/nest-common';

@Controller('products')
export class ProductController {
  @Get()
  async getProducts(@NestI18n() rawI18n: RawI18nContext) {
    const i18n = createI18nContext(rawI18n, 'products');
    
    return {
      message: i18n.t('list.success'),  // Translates to 'products.list.success'
      data: await this.productService.findAll(),
    };
  }
}
```

### 6. Response Interceptor

Unified API response formatting.

```typescript
import { ResponseInterceptor } from '@meta-1/nest-common';

@Controller()
@UseInterceptors(ResponseInterceptor)
export class UserController {
  @Get()
  async getUsers() {
    return { data: users };  // Will be wrapped automatically
  }
}
```

**Response Format:**
```json
{
  "code": 0,
  "success": true,
  "message": "Success",
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 7. Error Handling

Global error filter with custom error class and predefined error codes.

#### Setup

```typescript
import { ErrorsFilter } from '@meta-1/nest-common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Apply global error filter
  app.useGlobalFilters(new ErrorsFilter());
  
  await app.listen(3000);
}
```

#### Usage with ErrorCode (Recommended)

```typescript
import { AppError, ErrorCode } from '@meta-1/nest-common';

@Injectable()
export class UserService {
  async getUserById(id: string) {
    const user = await this.userRepository.findOne(id);
    
    if (!user) {
      // Use predefined error codes
      throw new AppError(ErrorCode.USER_NOT_FOUND, { userId: id });
    }
    
    return user;
  }

  async sendVerificationCode(email: string) {
    try {
      await this.mailService.send(email);
    } catch (error) {
      // Use module-specific error codes
      // import { MessageErrorCode } from '@meta-1/nest-message';
      throw new AppError(MessageErrorCode.EMAIL_SENDING_FAILED);
    }
  }
}
```

#### Legacy Usage (Still Supported)

```typescript
import { AppError } from '@meta-1/nest-common';

@Injectable()
export class UserService {
  async getUserById(id: string) {
    const user = await this.userRepository.findOne(id);
    
    if (!user) {
      // Legacy: manually specify code and message
      throw new AppError(404, 'User not found', { userId: id });
    }
    
    return user;
  }
}
```

#### Predefined Error Codes

**Common Module Error Codes (0-999):**

The `ErrorCode` object in `@meta-1/nest-common` provides type-safe, predefined error codes for common errors:

```typescript
import { ErrorCode } from '@meta-1/nest-common';

// General errors (0-999)
ErrorCode.SERVER_ERROR              // { code: 500, message: "Server Error" }
ErrorCode.VALIDATION_FAILED         // { code: 400, message: "Validation Failed" }
ErrorCode.UNAUTHORIZED              // { code: 401, message: "Unauthorized" }
ErrorCode.FORBIDDEN                 // { code: 403, message: "Forbidden" }
ErrorCode.NOT_FOUND                 // { code: 404, message: "Not Found" }
```

**Module-Specific Error Codes:**

Each module should define its own error codes in its own namespace:

```typescript
// Message module error codes (1000-1999)
import { MessageErrorCode } from '@meta-1/nest-message';

MessageErrorCode.VERIFICATION_CODE_STORAGE_FAILED  // { code: 1000, message: "..." }
MessageErrorCode.EMAIL_SENDING_FAILED              // { code: 1001, message: "..." }
MessageErrorCode.VERIFICATION_CODE_SEND_FAILED     // { code: 1002, message: "..." }
MessageErrorCode.MAIL_SERVICE_NOT_CONFIGURED       // { code: 1100, message: "..." }
MessageErrorCode.MAIL_CONTENT_EMPTY                // { code: 1101, message: "..." }

// User module error codes (2000-2999) - example
UserErrorCode.USER_NOT_FOUND                       // { code: 2000, message: "..." }
UserErrorCode.USER_ALREADY_EXISTS                  // { code: 2001, message: "..." }
```

**Error Code Range Convention:**
- **0-999**: Common/general errors (`@meta-1/nest-common`)
- **1000-1999**: Message module errors (`@meta-1/nest-message`)
- **2000-2999**: User module errors
- **3000-3999**: Auth module errors
- **...etc**

This modular approach keeps error codes organized by domain and prevents conflicts.

**Error Response Format:**
```json
{
  "code": 2000,
  "success": false,
  "message": "User not found",
  "data": { "userId": "123" },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/users/123"
}
```

**Zod Validation Error Response:**
```json
{
  "code": 0,
  "success": false,
  "message": "Validation failed",
  "data": [
    {
      "code": "invalid_format",
      "path": ["email"],
      "message": "Invalid email format"
    }
  ],
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/users"
}
```

### 8. Snowflake ID Generator

Distributed unique ID generation decorator.

```typescript
import { Snowflake } from '@meta-1/nest-common';

export class CreateUserDto {
  @Snowflake()
  id?: string;  // Auto-generated if not provided
  
  name: string;
  email: string;
}
```

**Features:**
- Generates Twitter Snowflake-style IDs
- Distributed system friendly
- Time-ordered
- 64-bit integer (returned as string for JavaScript compatibility)

### 9. Locale Sync

Automatic locale file synchronization with hot-reload support.

```typescript
import { syncLocales } from '@meta-1/nest-common';
import * as path from 'path';

async function bootstrap() {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Sync locale files with optional watching in development
  syncLocales({
    sourceDir: path.join(process.cwd(), 'locales'),
    targetDir: path.join(process.cwd(), 'dist/i18n'),
    watch: isDevelopment,  // Enable hot-reload in development
  });
  
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
```

**Source Structure:**
```
locales/
├── en.json
└── zh-CN.json
```

**Target Structure (auto-generated):**
```
dist/i18n/
├── en/
│   └── common.json
└── zh-CN/
    └── common.json
```

### 10. JWT Token Service

JWT token creation, validation, and parsing service.

#### Setup

```typescript
import { TokenService } from '@meta-1/nest-common';

@Module({
  providers: [
    {
      provide: TokenService,
      useFactory: () => new TokenService({
        secret: process.env.JWT_SECRET || 'your-secret-key',
        defaultExpiresIn: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      }),
    },
  ],
  exports: [TokenService],
})
export class AuthModule {}
```

#### Usage

**Create Token:**

```typescript
import { TokenService } from '@meta-1/nest-common';

@Injectable()
export class AuthService {
  constructor(private readonly tokenService: TokenService) {}

  async login(user: User) {
    const token = this.tokenService.create({
      id: user.id,
      username: user.username,
      expiresIn: 7 * 24 * 60 * 60 * 1000, // 7 days
      // Custom data
      role: user.role,
      permissions: user.permissions,
    });

    return { token };
  }
}
```

**Validate Token:**

```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      return false;
    }

    return this.tokenService.check(token);
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
```

**Parse Token:**

```typescript
@Injectable()
export class UserService {
  constructor(private readonly tokenService: TokenService) {}

  async getCurrentUser(token: string) {
    try {
      const payload = this.tokenService.parse(token);
      
      if (payload) {
        console.log('User ID:', payload.jti);
        console.log('Username:', payload.sub);
        console.log('Issued at:', new Date(payload.iat * 1000));
        console.log('Expires at:', new Date(payload.exp * 1000));
        
        // Access custom data
        console.log('Role:', payload.role);
        console.log('Permissions:', payload.permissions);
        
        return this.findUserById(payload.jti);
      }
    } catch (error) {
      // Handle TOKEN_EXPIRED, TOKEN_INVALID, etc.
      throw error;
    }
  }
}
```

**Refresh Token:**

```typescript
@Post('refresh')
async refreshToken(@Body('token') oldToken: string) {
  try {
    // Create a new token with the same data but extended expiration
    const newToken = this.tokenService.refresh(
      oldToken,
      7 * 24 * 60 * 60 * 1000 // 7 days
    );
    
    return { token: newToken };
  } catch (error) {
    throw new AppError(ErrorCode.TOKEN_INVALID);
  }
}
```

**Extract Information Without Validation:**

```typescript
// Quick extraction without signature verification
// Useful for logging or non-security-critical operations
const userId = this.tokenService.extractUserId(token);
const username = this.tokenService.extractUsername(token);

console.log(`Request from user: ${username} (${userId})`);
```

#### Token Payload Structure

```typescript
interface TokenPayload {
  jti: string;       // JWT ID (user ID)
  sub: string;       // Subject (username)
  iat: number;       // Issued at (seconds)
  exp: number;       // Expires at (seconds)
  [key: string]: unknown; // Custom fields
}
```

#### Error Codes

| Error Code | Code | Message |
|-----------|------|---------|
| `TOKEN_SECRET_REQUIRED` | 200 | Token secret is required |
| `TOKEN_CREATE_ERROR` | 201 | Token creation failed |
| `TOKEN_EXPIRED` | 202 | Token has expired |
| `TOKEN_INVALID` | 203 | Token is invalid |
| `TOKEN_PARSE_ERROR` | 204 | Token parse error |

## 📝 API Reference

### Decorators

- `@CacheableService()` - Mark a service class for caching support
- `@Cacheable(options)` - Cache method results
- `@CacheEvict(options)` - Evict cache entries
- `@WithLock(options)` - Distributed lock for preventing concurrent execution
- `@I18n()` - Inject I18nContext into controller methods
- `@Snowflake()` - Auto-generate Snowflake ID for DTO properties
- `@Transactional()` - Automatic database transaction management

### Classes

- `AppError` - Custom error class with code, message, and data
- `I18nContext` - Enhanced i18n context with namespace support
- `ErrorsFilter` - Global exception filter
- `ResponseInterceptor` - Response formatting interceptor
- `TokenService` - JWT token service for creation, validation, and parsing
- `LockInitializer` - Automatic Redis injection for distributed lock
- `CacheableInitializer` - Automatic Redis injection for caching

### Functions

- `syncLocales(options)` - Sync locale files with hot-reload support
- `createI18nContext(context, namespace)` - Create custom namespace context
- `injectRedisToInstance(instance, redis)` - Inject Redis into service instances for caching
- `injectRedisForLock(instance, redis)` - Inject Redis into service instances for distributed lock
- `hasCacheableMetadata(target)` - Check if class has cacheable metadata

### Error Codes

**Lock Error Codes (100-199):**
- `REDIS_NOT_INJECTED` (100) - Redis not injected
- `LOCK_ACQUIRE_FAILED` (110) - Failed to acquire lock
- `LOCK_ACQUIRE_ERROR` (111) - Error while acquiring lock
- `LOCK_RELEASE_ERROR` (112) - Error while releasing lock

**Common Error Codes (0-999):**
- `SERVER_ERROR` (500) - Server error
- `VALIDATION_FAILED` (400) - Validation failed
- `UNAUTHORIZED` (401) - Unauthorized
- `FORBIDDEN` (403) - Forbidden
- `NOT_FOUND` (404) - Not found

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

