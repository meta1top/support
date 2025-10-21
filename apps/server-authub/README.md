# Server Demo - NestJS 演示服务

基于 NestJS 11 构建的演示后端服务，集成了 Nacos 配置管理、Redis 缓存、TypeORM、国际化等企业级功能。

## ✨ 特性

- 🏗️ **NestJS 框架** - 企业级 Node.js 框架
- ⚙️ **Nacos 集成** - 配置管理和服务发现
- 💾 **Redis 缓存** - 高性能缓存支持
- 🗄️ **TypeORM** - 数据库 ORM 支持
- 🌍 **国际化** - 多语言支持（中英文）
- 📝 **Swagger 文档** - 自动生成 API 文档
- 🔒 **类型安全** - 完整的 TypeScript 支持
- ⚡ **统一响应** - 标准化的 API 响应格式
- 🚨 **错误处理** - 全局异常过滤器
- ❄️ **分布式 ID** - Snowflake ID 生成器

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 8
- Redis >= 6.0
- MySQL >= 8.0 (可选)
- Nacos >= 2.0 (可选)

### 安装依赖

```bash
# 在项目根目录
pnpm install
```

### 环境变量配置

在项目根目录创建 `.env` 文件：

```env
# 应用配置
NODE_ENV=development
PORT=3100

# Nacos 配置（可选，不配置则跳过）
NACOS_SERVER=localhost:8848
NACOS_NAMESPACE=public
NACOS_USERNAME=nacos
NACOS_PASSWORD=nacos
NACOS_DATA_ID=app-config
NACOS_GROUP=DEFAULT_GROUP

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# 数据库配置
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=demo
```

### 启动服务

```bash
# 开发模式（监听文件变化）
pnpm run dev:server-demo

# 生产模式构建
pnpm run build:server-demo

# 启动生产服务
pnpm run start:server-demo
```

服务将在 http://localhost:3100 启动。

### 访问 Swagger 文档

启动服务后，访问 http://localhost:3100/api 查看 API 文档。

## 📦 技术栈

### 核心框架
- **NestJS 11** - 企业级 Node.js 框架
- **TypeScript 5** - 类型安全
- **Express** - HTTP 服务器

### 数据库和缓存
- **TypeORM** - ORM 框架
- **MySQL** - 关系型数据库
- **Redis** - 缓存和会话存储
- **ioredis** - Redis 客户端

### 配置和服务发现
- **@meta-1/nest-nacos** - Nacos 集成
- **@nestjs/config** - 配置管理

### 工具库
- **@meta-1/nest-common** - 通用工具和装饰器
- **nestjs-i18n** - 国际化支持
- **@nestjs/swagger** - API 文档生成
- **nestjs-zod** - 数据验证
- **dotenv** - 环境变量管理

## 🗂️ 项目结构

```
apps/server-demo/
├── src/
│   ├── app.controller.ts      # 主控制器
│   ├── app.module.ts          # 主模块
│   ├── app.swagger.ts         # Swagger 配置
│   ├── app.types.ts           # 类型定义
│   └── main.ts                # 应用入口
└── tsconfig.app.json          # TypeScript 配置
```

## 🎯 核心功能

### 国际化（i18n）

使用 `@meta-1/nest-common` 提供的 i18n 装饰器：

```typescript
import { I18n, I18nContext } from '@meta-1/nest-common';

@Controller('users')
export class UserController {
  @Get()
  async getUsers(@I18n() i18n: I18nContext) {
    return {
      message: i18n.t('users.list.success'),
      data: await this.userService.findAll(),
    };
  }
}
```

语言文件位于项目根目录的 `locales/` 文件夹：
- `locales/en.json` - 英文
- `locales/zh-CN.json` - 中文

### 缓存装饰器

使用 Spring Boot 风格的缓存装饰器：

```typescript
import { CacheableService, Cacheable, CacheEvict } from '@meta-1/nest-common';

@CacheableService()
@Injectable()
export class UserService {
  // 缓存结果 5 分钟
  @Cacheable({ key: 'user:#{0}', ttl: 300 })
  async getUserById(id: string) {
    return await this.userRepository.findOne(id);
  }

  // 更新时清除缓存
  @CacheEvict({ key: 'user:#{0}' })
  async updateUser(id: string, data: UpdateUserDto) {
    return await this.userRepository.update(id, data);
  }
}
```

### Nacos 配置管理

在 `main.ts` 中加载 Nacos 配置：

```typescript
import { loadNacosConfig } from '@meta-1/nest-nacos';

async function bootstrap() {
  // 加载 Nacos 配置
  const nacosConfig = await loadNacosConfig<AppConfig>();
  
  // 创建应用
  const app = await NestFactory.create(AppModule.forRoot(nacosConfig));
  
  await app.listen(3100);
}
```

在模块中注册 Nacos：

```typescript
import { NacosModule } from '@meta-1/nest-nacos';

@Module({
  imports: [
    NacosModule.forRoot({
      server: process.env.NACOS_SERVER,
      namespace: process.env.NACOS_NAMESPACE,
      username: process.env.NACOS_USERNAME,
      password: process.env.NACOS_PASSWORD,
      config: {
        dataId: process.env.NACOS_DATA_ID,
        group: process.env.NACOS_GROUP,
      },
    }),
  ],
})
export class AppModule {}
```

### 统一响应格式

使用响应拦截器自动格式化响应：

```typescript
import { ResponseInterceptor } from '@meta-1/nest-common';

@Controller()
@UseInterceptors(ResponseInterceptor)
export class AppController {
  @Get()
  getData() {
    return { data: 'Hello World' };
  }
}
```

响应格式：
```json
{
  "code": 0,
  "success": true,
  "message": "Success",
  "data": { "data": "Hello World" },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 错误处理

使用全局异常过滤器：

```typescript
import { ErrorsFilter, AppError } from '@meta-1/nest-common';

// 在 main.ts 中注册
app.useGlobalFilters(new ErrorsFilter());

// 在服务中使用
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

### Snowflake ID 生成

使用装饰器自动生成分布式 ID：

```typescript
import { Snowflake } from '@meta-1/nest-common';

export class CreateUserDto {
  @Snowflake()
  id?: string;  // 如果不提供，将自动生成
  
  name: string;
  email: string;
}
```

### Swagger 文档

在 `app.swagger.ts` 中配置：

```typescript
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Server Demo API')
    .setDescription('演示服务 API 文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
}
```

## 🔧 开发指南

### 添加新的控制器

```bash
nest g controller users
```

### 添加新的服务

```bash
nest g service users
```

### 添加新的模块

```bash
nest g module users
```

### 数据验证

使用 Zod 或 class-validator 进行数据验证：

```typescript
import { z } from 'nestjs-zod';

const CreateUserSchema = z.object({
  name: z.string().min(1).max(50),
  email: z.string().email(),
  age: z.number().min(0).max(150),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
```

## 🧪 测试

```bash
# 单元测试
pnpm test

# 监听模式
pnpm test:watch

# 测试覆盖率
pnpm test:cov

# E2E 测试
pnpm test:e2e
```

## 📝 代码规范

### 使用 Biome 检查和格式化

```bash
# 检查代码
pnpm run lint

# 格式化代码
pnpm run format
```

## 🚀 部署

### 构建生产版本

```bash
pnpm run build:server-demo
```

构建文件将输出到 `dist/apps/server-demo/` 目录。

### 运行生产版本

```bash
pnpm run start:server-demo
```

### Docker 部署（可选）

创建 `Dockerfile`：

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

COPY . .
RUN pnpm run build:server-demo

EXPOSE 3100

CMD ["node", "dist/apps/server-demo/main.js"]
```

## 📖 API 文档

启动服务后访问：
- Swagger UI: http://localhost:3100/api
- JSON 格式: http://localhost:3100/api-json

## 🛠️ 故障排查

### Redis 连接失败

检查 Redis 服务是否启动：
```bash
redis-cli ping
```

确保 `.env` 中的 Redis 配置正确。

### Nacos 连接失败

确保 Nacos 服务运行在配置的地址，可以通过浏览器访问：
http://localhost:8848/nacos

### 数据库连接失败

检查 MySQL 服务状态和 `.env` 中的数据库配置。

## 📄 许可证

MIT

