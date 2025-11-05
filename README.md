# Meta-1 全栈开发框架

<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="100" alt="Nest Logo" />
  <img src="https://assets.vercel.com/image/upload/v1662130559/nextjs/Icon_light_background.png" width="100" alt="Next.js Logo" style="margin-left: 20px;" />
</p>

基于 NestJS、Next.js 和 React 构建的企业级全栈开发 Monorepo 项目，提供完整的后端服务、前端应用和 UI 组件库。

## 📦 项目结构

此 monorepo 包含以下项目：

### 后端应用 (NestJS)

#### [server-demo](./apps/server-demo) | [📖 文档](./apps/server-demo/README.md)
NestJS 演示后端服务，集成了 Nacos 配置管理、Redis 缓存、TypeORM、国际化等企业级功能。
- 🏗️ **NestJS 框架** - 企业级 Node.js 框架
- ⚙️ **Nacos 集成** - 配置管理和服务发现
- 💾 **Redis 缓存** - 高性能缓存支持
- 🗄️ **TypeORM** - 数据库 ORM 支持
- 🌍 **国际化** - 多语言支持（中英文）
- 📝 **Swagger 文档** - 自动生成 API 文档

### 前端应用 (Next.js)

#### [@meta-1/web-design](./apps/web-design) | [📖 文档](./apps/web-design/README.md)
设计系统展示平台，用于预览和测试 UI 组件。
- 📚 **组件展示** - 所有 @meta-1/design 组件的实时预览
- 🎨 **主题切换** - 明暗主题支持
- 📱 **响应式设计** - 适配各种屏幕尺寸
- 🎮 **交互式演示** - 实时调整组件参数

#### [@meta-1/web-editor](./apps/web-editor) | [📖 文档](./apps/web-editor/README.md)
富文本编辑器展示平台，用于预览和测试编辑器功能。
- ✏️ **富文本编辑** - 基于 Tiptap 的现代编辑器
- 🎯 **功能演示** - 各种编辑器扩展和功能展示
- 📝 **Markdown 支持** - Markdown 语法快捷输入
- 🎨 **主题适配** - 明暗主题自动适配

### UI 组件库

#### [@meta-1/design](./packages/design) | [📖 文档](./packages/design/README.md)
基于 Radix UI 和 Tailwind CSS 的 React 组件库。

**特性：**
- 🎨 **现代设计** - 美观、易用的 UI 组件
- ♿ **无障碍访问** - 符合 WCAG 标准
- 🎯 **类型安全** - 完整的 TypeScript 支持
- 🌗 **主题系统** - 支持明暗主题切换
- 📦 **模块化** - 按需导入，减小包体积

#### [@meta-1/editor](./packages/editor) | [📖 文档](./packages/editor/README.md)
基于 Tiptap 的富文本编辑器组件库。

**特性：**
- ✏️ **富文本编辑** - 完整的文本编辑功能
- 🔌 **扩展系统** - 灵活的插件架构
- 🎨 **自定义样式** - 可定制的外观
- 📝 **Markdown 支持** - 支持 Markdown 语法
- 🌍 **国际化** - 内置多语言支持

### NestJS 库

#### [@meta-1/nest-common](./libs/common) | [📖 文档](./libs/common/README.md)
NestJS 通用工具和装饰器。

**特性：**
- 🎯 **缓存装饰器** - Spring Boot 风格的 `@Cacheable` 和 `@CacheEvict`
- 👤 **会话服务** - Redis 会话管理，支持 JWT Token
- 🔐 **认证装饰器** - `@Public` 装饰器和 `AuthGuard` 路由保护
- 🌍 **国际化工具** - 增强的 i18n 包装器，支持命名空间
- ⚡ **响应拦截器** - 统一的 API 响应格式
- 🚨 **错误处理** - 全局异常过滤器，支持预定义错误码
- ❄️ **雪花 ID** - 分布式唯一 ID 生成器
- 🔄 **语言包同步** - 自动同步语言文件，支持热重载
- 🔐 **JWT Token 服务** - Token 创建、验证和解析

#### [@meta-1/nest-nacos](./libs/nacos) | [📖 文档](./libs/nacos/README.md)
Nacos 配置管理和服务发现的 NestJS 集成模块。

**特性：**
- ⚙️ **配置管理** - 动态配置加载和热重载
- 🔍 **服务发现** - 服务注册和健康检查
- 🔄 **自动刷新** - 实时配置更新
- 🛡️ **类型安全** - 完整的 TypeScript 支持
- 📝 **YAML 支持** - 解析和转换 YAML 配置，自动 camelCase 转换

#### [@meta-1/nest-message](./libs/message) | [📖 文档](./libs/message/README.md)
邮件服务和验证码功能的 NestJS 模块。

**特性：**
- 📧 **邮件发送** - 支持 AWS SES 和阿里云邮件推送
- 🔐 **验证码** - 邮箱验证码发送和管理
- 🎨 **HTML 模板** - 精美的邮件模板
- 🌍 **多区域支持** - 支持多个云服务区域
- 🚨 **错误码** - 预定义错误码（1000-1999）

#### [@meta-1/nest-security](./libs/security) | [📖 文档](./libs/security/README.md)
NestJS 安全和认证模块。

**特性：**
- 🔐 **会话管理** - Redis 会话存储
- 🔑 **Token 管理** - JWT Token 生成和验证
- 🔒 **OTP 支持** - 一次性密码（OTP）功能
- 🛡️ **拦截器** - 认证和授权拦截器
- 🎯 **装饰器** - 自定义安全装饰器

#### [@meta-1/nest-assets](./libs/assets) | [📖 文档](./libs/assets/README.md)
NestJS 资源管理模块，支持对象存储。

**特性：**
- ☁️ **多云支持** - 支持 AWS S3 和阿里云 OSS
- 📤 **预签名上传** - 客户端直传，减轻服务器压力
- 🔒 **私桶支持** - 私有资源访问控制
- 🔗 **URL 签名** - 可配置签名有效期
- 🎯 **统一接口** - 自动切换存储提供商

#### [@meta-1/nest-types](./libs/types) | [📖 文档](./libs/types/README.md)
共享类型定义和 Zod Schema。

**特性：**
- 🛡️ **类型安全** - TypeScript 类型定义
- ✅ **数据验证** - Zod Schema 验证
- 🔄 **共享复用** - 前后端共享类型

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 8

### 安装依赖

```bash
# 克隆仓库
git clone <repository-url>
cd support

# 安装依赖
pnpm install
```

### 项目结构

```
support/
├── apps/                        # 应用程序
│   ├── server-demo/            # NestJS 演示服务
│   ├── web-design/             # 设计系统展示
│   └── web-editor/             # 编辑器展示
├── packages/                    # 前端包
│   ├── design/                 # UI 组件库
│   └── editor/                 # 富文本编辑器
├── libs/                        # NestJS 库
│   ├── common/                 # 通用工具
│   ├── nacos/                  # Nacos 集成
│   ├── message/                # 邮件服务
│   ├── security/               # 安全认证
│   ├── assets/                 # 资源管理
│   └── types/                  # 类型定义
├── locales/                     # 国际化语言文件
│   ├── en.json
│   └── zh-CN.json
├── scripts/                     # 构建和工具脚本
│   ├── copy-dist.ts
│   └── sync-locales-cli.ts
└── package.json
```

## 🛠️ 开发指南

### 可用命令

#### 后端开发

```bash
# 开发模式运行后端服务
pnpm run dev:server            # 启动 server-demo (端口: 3100)

# 构建后端服务
pnpm run build:server          # 构建 server-demo

# 启动生产服务
pnpm run start:server          # 运行构建后的服务
```

#### 前端开发

```bash
# 开发模式运行前端应用
pnpm run dev:web-design        # 设计系统展示 (端口: 4000)
pnpm run dev:web-editor        # 编辑器展示 (端口: 4001)

# 构建前端应用
pnpm run build:web-design      # 构建设计系统展示
pnpm run build:web-editor      # 构建编辑器展示
```

#### NestJS 库构建

```bash
# 构建库（编译 + 复制）
pnpm run build:common          # 构建 common 库
pnpm run build:nacos           # 构建 nacos 库
pnpm run build:message         # 构建 message 库
pnpm run build:security        # 构建 security 库
pnpm run build:assets          # 构建 assets 库
pnpm run build:types           # 构建 types 库

# 仅编译
pnpm run build:nest:common     # 仅编译 common 库
pnpm run build:nest:nacos      # 仅编译 nacos 库
pnpm run build:nest:message    # 仅编译 message 库
pnpm run build:nest:security   # 仅编译 security 库
pnpm run build:nest:assets     # 仅编译 assets 库
pnpm run build:nest:types      # 仅编译 types 库

# 复制构建文件
pnpm run copy:common           # 复制到 libs/common/dist
pnpm run copy:nacos            # 复制到 libs/nacos/dist
pnpm run copy:message          # 复制到 libs/message/dist
pnpm run copy:security         # 复制到 libs/security/dist
pnpm run copy:assets           # 复制到 libs/assets/dist
pnpm run copy:types            # 复制到 libs/types/dist
```

#### 工具命令

```bash
# 同步语言文件
pnpm run sync:locales

# 代码检查和格式化
pnpm run lint                  # 运行代码检查
pnpm run format                # 格式化代码

# 测试
pnpm run test                  # 运行单元测试
pnpm run test:watch            # 监听模式运行测试
pnpm run test:cov              # 运行测试并生成覆盖率报告
```

## 📚 文档导航

### 后端库
- [@meta-1/nest-common](./libs/common/README.md) - 缓存、会话、认证、国际化、错误处理等
- [@meta-1/nest-nacos](./libs/nacos/README.md) - Nacos 配置管理和服务发现
- [@meta-1/nest-message](./libs/message/README.md) - 邮件服务和验证码
- [@meta-1/nest-security](./libs/security/README.md) - 安全认证和会话管理
- [@meta-1/nest-assets](./libs/assets/README.md) - 对象存储和资源管理
- [@meta-1/nest-types](./libs/types/README.md) - 类型定义和 Schema

### 前端库
- [@meta-1/design](./packages/design/README.md) - UI 组件库使用指南
- [@meta-1/editor](./packages/editor/README.md) - 富文本编辑器使用指南

### 应用
- [Server Demo](./apps/server-demo/README.md) - 后端服务完整文档
- [Web Design](./apps/web-design/README.md) - 设计系统展示应用
- [Web Editor](./apps/web-editor/README.md) - 编辑器展示应用

## 🔧 配置

项目采用 Nacos 配置中心统一管理配置：
- 环境变量只需配置 Nacos 连接信息
- 所有业务配置（数据库、Redis 等）通过 Nacos 管理
- 支持配置热更新和环境隔离
- Nacos 不可用时支持降级启动

详细配置说明请查看 [server-demo 文档](./apps/server-demo/README.md)

## 🧪 测试

```bash
# 运行单元测试
pnpm run test

# 监听模式运行测试
pnpm run test:watch

# 生成覆盖率报告
pnpm run test:cov
```


## 🛠️ 技术栈

### 后端
- **NestJS 11** - 企业级 Node.js 框架
- **TypeScript 5** - 类型安全的 JavaScript
- **Redis** - 缓存和会话存储（ioredis）
- **TypeORM** - ORM 框架，支持多种数据库
- **MySQL** - 关系型数据库
- **Nacos** - 配置管理和服务发现
- **Zod** - 数据验证和 Schema 定义
- **AWS SDK** - AWS SES、S3 等云服务
- **Aliyun SDK** - 阿里云 OSS、邮件推送等

### 前端
- **Next.js 16** - React 应用框架
- **React 19** - UI 库
- **TypeScript 5** - 类型安全
- **Tailwind CSS 4** - 原子化 CSS 框架
- **Radix UI** - 无障碍 UI 基础组件
- **Tiptap** - 富文本编辑器框架
- **Recoil** - 状态管理
- **React Query** - 数据获取和缓存
- **date-fns** - 日期处理
- **Zod** - 数据验证

### 工具
- **pnpm** - 高效的包管理器
- **Biome** - 快速的代码检查和格式化工具
- **Vite** - 极速的构建工具
- **Jest** - 单元测试框架
- **GitLab CI** - CI/CD 持续集成

## 📝 许可证

[MIT Licensed](LICENSE)

## 🤝 贡献

欢迎贡献！请随时提交 Pull Request。

## 📧 支持

如有问题和支持需求，请在仓库中提交 issue。
