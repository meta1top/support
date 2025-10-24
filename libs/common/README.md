# @meta-1/nest-common

Common utilities and decorators for NestJS applications including caching, i18n, error handling, and more.

## ✨ Features

- 🎯 **Caching Decorators** - Spring Boot-style `@Cacheable` and `@CacheEvict` decorators with Redis support
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

### 2. Session Service

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

### 3. @Public 装饰器

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

### 4. I18n with Namespace Support

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

### 4. Response Interceptor

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

### 5. Error Handling

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

### 6. Snowflake ID Generator

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

### 7. Locale Sync

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

### 8. JWT Token Service

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
- `@I18n()` - Inject I18nContext into controller methods
- `@Snowflake()` - Auto-generate Snowflake ID for DTO properties

### Classes

- `AppError` - Custom error class with code, message, and data
- `I18nContext` - Enhanced i18n context with namespace support
- `ErrorsFilter` - Global exception filter
- `ResponseInterceptor` - Response formatting interceptor
- `TokenService` - JWT token service for creation, validation, and parsing

### Functions

- `syncLocales(options)` - Sync locale files with hot-reload support
- `createI18nContext(context, namespace)` - Create custom namespace context
- `injectRedisToInstance(instance, redis)` - Inject Redis into service instances
- `hasCacheableMetadata(target)` - Check if class has cacheable metadata

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

