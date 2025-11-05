# @meta-1/nest-security

NestJS 安全和认证模块，提供会话管理、Token 管理、OTP 支持等安全功能。

## ✨ 特性

- 🔐 **会话管理** - Redis 会话存储和管理
- 🔑 **Token 管理** - JWT Token 生成和验证
- 🔒 **OTP 支持** - 一次性密码（OTP）功能
- 🛡️ **拦截器** - 认证和授权拦截器
- 🎯 **装饰器** - 自定义安全装饰器
- 🔄 **会话刷新** - 会话过期时间刷新
- 📝 **类型安全** - 完整的 TypeScript 支持

## 📦 安装

```bash
npm install @meta-1/nest-security
# 或
pnpm add @meta-1/nest-security
# 或
yarn add @meta-1/nest-security
```

### 依赖安装

```bash
npm install @nestjs/common @nestjs-modules/ioredis ioredis
```

## 🚀 使用

### 1. 会话管理

#### 模块导入

```typescript
import { Module } from '@nestjs/common';
import { SecurityModule } from '@meta-1/nest-security';

@Module({
  imports: [
    SecurityModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
      jwt: {
        secret: 'your-secret-key',
        expiresIn: '7d',
      },
    }),
  ],
})
export class AppModule {}
```

#### 会话服务使用

```typescript
import { Injectable } from '@nestjs/common';
import { SessionService, SessionUser } from '@meta-1/nest-security';

@Injectable()
export class AuthService {
  constructor(private readonly sessionService: SessionService) {}

  async login(user: User): Promise<string> {
    // 创建 JWT token
    const jwtToken = this.tokenService.create({
      id: user.id,
      username: user.username,
      expiresIn: '7d',
    });

    // 构建会话数据
    const sessionUser: SessionUser = {
      id: user.id,
      username: user.username,
      authorities: ['ROLE_USER'],
      apis: [
        { path: '/api/users', method: 'GET' },
        { path: '/api/users/:id', method: 'PUT' },
      ],
      expiresIn: 7 * 24 * 60 * 60 * 1000, // 7 天
      jwtToken,
    };

    // 存储会话，返回 MD5 后的 token
    const tokenHash = await this.sessionService.login(sessionUser);
    
    return tokenHash;
  }

  async logout(tokenHash: string): Promise<void> {
    await this.sessionService.logout(tokenHash);
  }

  async getCurrentUser(tokenHash: string): Promise<SessionUser | null> {
    return await this.sessionService.get(tokenHash);
  }

  async refreshSession(tokenHash: string): Promise<boolean> {
    const expiresIn = 7 * 24 * 60 * 60 * 1000; // 7 天
    return await this.sessionService.refresh(tokenHash, expiresIn);
  }
}
```

### 2. Token 管理

```typescript
import { Injectable } from '@nestjs/common';
import { TokenService } from '@meta-1/nest-security';

@Injectable()
export class AuthService {
  constructor(private readonly tokenService: TokenService) {}

  createToken(user: User): string {
    return this.tokenService.create({
      id: user.id,
      username: user.username,
      role: user.role,
      expiresIn: '7d',
    });
  }

  validateToken(token: string): boolean {
    return this.tokenService.check(token);
  }

  parseToken(token: string): TokenPayload | null {
    return this.tokenService.parse(token);
  }

  refreshToken(oldToken: string): string {
    return this.tokenService.refresh(oldToken, '7d');
  }
}
```

### 3. OTP 支持

```typescript
import { Injectable } from '@nestjs/common';
import { OtpService } from '@meta-1/nest-security';

@Injectable()
export class AuthService {
  constructor(private readonly otpService: OtpService) {}

  async generateOtp(userId: string): Promise<string> {
    // 生成 6 位数字 OTP，有效期 5 分钟
    const otp = await this.otpService.generate(userId, {
      length: 6,
      expiresIn: 300, // 5 分钟
    });
    
    return otp;
  }

  async verifyOtp(userId: string, otp: string): Promise<boolean> {
    return await this.otpService.verify(userId, otp);
  }

  async invalidateOtp(userId: string): Promise<void> {
    await this.otpService.invalidate(userId);
  }
}
```

### 4. 认证拦截器

```typescript
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuthInterceptor } from '@meta-1/nest-security';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AuthInterceptor,
    },
  ],
})
export class AppModule {}
```

### 5. 装饰器使用

#### @CurrentUser() - 获取当前用户

```typescript
import { Controller, Get } from '@nestjs/common';
import { CurrentUser, SessionUser } from '@meta-1/nest-security';

@Controller('users')
export class UserController {
  @Get('profile')
  getProfile(@CurrentUser() user: SessionUser | undefined) {
    if (!user) {
      throw new UnauthorizedException('Please login first');
    }
    
    return {
      id: user.id,
      username: user.username,
      authorities: user.authorities,
    };
  }
}
```

#### @Public() - 标记公开路由

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { Public } from '@meta-1/nest-security';

@Controller('auth')
export class AuthController {
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
}
```

## 📝 API 参考

### SessionService

- `login(user: SessionUser): Promise<string>` - 用户登录，存储会话，返回 MD5 后的 token
- `logout(tokenHash: string): Promise<void>` - 用户登出，删除会话
- `get(tokenHash: string): Promise<SessionUser | null>` - 获取会话信息
- `refresh(tokenHash: string, expiresIn: number): Promise<boolean>` - 刷新会话过期时间
- `exists(tokenHash: string): Promise<boolean>` - 检查会话是否存在

### TokenService

- `create(payload: TokenPayload): string` - 创建 JWT token
- `check(token: string): boolean` - 验证 token 是否有效
- `parse(token: string): TokenPayload | null` - 解析 token 获取 payload
- `refresh(token: string, expiresIn: string | number): string` - 刷新 token
- `extractUserId(token: string): string | null` - 提取用户 ID
- `extractUsername(token: string): string | null` - 提取用户名

### OtpService

- `generate(userId: string, options?: OtpOptions): Promise<string>` - 生成 OTP
- `verify(userId: string, otp: string): Promise<boolean>` - 验证 OTP
- `invalidate(userId: string): Promise<void>` - 使 OTP 失效

## 🔧 配置选项

### SecurityModule 配置

```typescript
interface SecurityModuleOptions {
  // Redis 配置
  redis: {
    host: string;
    port: number;
    password?: string;
    db?: number;
  };
  
  // JWT 配置
  jwt: {
    secret: string;
    expiresIn?: string | number;
  };
  
  // OTP 配置（可选）
  otp?: {
    length?: number;        // OTP 长度，默认 6
    expiresIn?: number;     // 过期时间（秒），默认 300
    numeric?: boolean;      // 是否只包含数字，默认 true
  };
  
  // 会话配置（可选）
  session?: {
    prefix?: string;        // Redis key 前缀，默认 'session'
    expiresIn?: number;     // 默认过期时间（毫秒）
  };
}
```

## 🔐 安全最佳实践

1. **使用强密钥** - JWT secret 应该足够复杂且定期更换
2. **合理设置过期时间** - 根据业务需求设置合适的会话和 token 过期时间
3. **保护敏感信息** - 不要在 token 中存储敏感信息
4. **使用 HTTPS** - 生产环境必须使用 HTTPS
5. **限制 OTP 尝试次数** - 防止暴力破解
6. **记录安全事件** - 记录登录、登出、token 刷新等安全事件
7. **定期清理过期会话** - 避免 Redis 内存占用过多

## 📄 许可证

MIT

## 🤝 贡献

欢迎贡献！请随时提交 Pull Request。

