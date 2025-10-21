# @meta-1/nest-common

Common utilities and decorators for NestJS applications including caching, i18n, error handling, and more.

## ✨ Features

- 🎯 **Caching Decorators** - Spring Boot-style `@Cacheable` and `@CacheEvict` decorators with Redis support
- 🌍 **I18n Utilities** - Enhanced internationalization wrapper with namespace support
- ⚡ **Response Interceptor** - Unified API response formatting
- 🚨 **Error Handling** - Global error filter with custom `AppError` class
- ❄️ **Snowflake ID Generator** - Distributed unique ID generation decorator
- 🔄 **Locale Sync** - Automatic locale file synchronization with hot-reload

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

### 2. I18n with Namespace Support

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

### 3. Response Interceptor

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

### 4. Error Handling

Global error filter with custom error class.

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

#### Usage

```typescript
import { AppError } from '@meta-1/nest-common';

@Injectable()
export class UserService {
  async getUserById(id: string) {
    const user = await this.userRepository.findOne(id);
    
    if (!user) {
      throw new AppError(404, 'User not found', { userId: id });
    }
    
    return user;
  }
}
```

**Error Response Format:**
```json
{
  "code": 404,
  "success": false,
  "message": "User not found",
  "data": { "userId": "123" },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/users/123"
}
```

### 5. Snowflake ID Generator

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

### 6. Locale Sync

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

### Functions

- `syncLocales(options)` - Sync locale files with hot-reload support
- `createI18nContext(context, namespace)` - Create custom namespace context
- `injectRedisToInstance(instance, redis)` - Inject Redis into service instances
- `hasCacheableMetadata(target)` - Check if class has cacheable metadata

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

