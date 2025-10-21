# Meta-1 全栈开发框架

<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="100" alt="Nest Logo" />
  <img src="https://nextjs.org/static/favicon/favicon-32x32.png" width="100" alt="Next.js Logo" style="margin-left: 20px;" />
</p>

基于 NestJS、Next.js 和 React 构建的企业级全栈开发 Monorepo 项目，提供完整的后端服务、前端应用和 UI 组件库。

## 📦 项目结构

此 monorepo 包含以下项目：

### 后端应用 (NestJS)

#### [server-demo](./apps/server-demo)
演示后端服务，集成了 Nacos 配置管理、Redis 缓存、国际化等功能。

### 前端应用 (Next.js)

#### [@meta-1/web-authub](./apps/web-authub)
统一用户授权平台，提供用户认证、授权和管理功能。
- 🔐 **用户认证** - 登录、注册、密码重置
- 👤 **用户管理** - 个人资料、账号设置
- 🎨 **现代 UI** - 基于 Tailwind CSS 和 @meta-1/design
- 🌍 **国际化** - 支持多语言切换

#### [@meta-1/web-design](./apps/web-design)
设计系统展示平台，用于预览和测试 UI 组件。
- 📚 **组件展示** - 所有 @meta-1/design 组件的实时预览
- 🎨 **主题切换** - 明暗主题支持
- 📱 **响应式设计** - 适配各种屏幕尺寸

#### [@meta-1/web-editor](./apps/web-editor)
富文本编辑器展示平台，用于预览和测试编辑器功能。
- ✏️ **富文本编辑** - 基于 Tiptap 的现代编辑器
- 🎯 **功能演示** - 各种编辑器扩展和功能展示

### UI 组件库

#### [@meta-1/design](./packages/design)
基于 Radix UI 和 Tailwind CSS 的 React 组件库。

**特性：**
- 🎨 **现代设计** - 美观、易用的 UI 组件
- ♿ **无障碍访问** - 符合 WCAG 标准
- 🎯 **类型安全** - 完整的 TypeScript 支持
- 🌗 **主题系统** - 支持明暗主题切换
- 📦 **模块化** - 按需导入，减小包体积

#### [@meta-1/editor](./packages/editor)
基于 Tiptap 的富文本编辑器组件库。

**特性：**
- ✏️ **富文本编辑** - 完整的文本编辑功能
- 🔌 **扩展系统** - 灵活的插件架构
- 🎨 **自定义样式** - 可定制的外观
- 📝 **Markdown 支持** - 支持 Markdown 语法
- 🌍 **国际化** - 内置多语言支持

### NestJS 库

#### [@meta-1/nest-common](./libs/common)
NestJS 通用工具和装饰器。

**特性：**
- 🎯 **缓存装饰器** - Spring Boot 风格的 `@Cacheable` 和 `@CacheEvict`
- 🌍 **国际化工具** - 增强的 i18n 包装器
- ⚡ **响应拦截器** - 统一的 API 响应格式
- 🚨 **错误处理** - 全局异常过滤器
- ❄️ **雪花 ID** - 分布式唯一 ID 生成器
- 🔄 **语言包同步** - 自动同步语言文件，支持热重载

#### [@meta-1/nest-nacos](./libs/nacos)
Nacos 配置管理和服务发现的 NestJS 集成模块。

**特性：**
- ⚙️ **配置管理** - 动态配置加载和热重载
- 🔍 **服务发现** - 服务注册和健康检查
- 🔄 **自动刷新** - 实时配置更新
- 🛡️ **类型安全** - 完整的 TypeScript 支持
- 📝 **YAML 支持** - 解析和转换 YAML 配置

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
│   ├── server-demo/            # NestJS 后端服务
│   ├── web-authub/             # 用户授权平台
│   ├── web-design/             # 设计系统展示
│   └── web-editor/             # 编辑器展示
├── packages/                    # 前端包
│   ├── design/                 # UI 组件库
│   └── editor/                 # 富文本编辑器
├── libs/                        # NestJS 库
│   ├── common/                 # 通用工具
│   └── nacos/                  # Nacos 集成
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
pnpm run dev:server-demo

# 构建后端服务
pnpm run build:server-demo

# 运行生产环境后端
pnpm run start:server-demo
```

#### 前端开发

```bash
# 开发模式运行前端应用
pnpm run dev:web-authub        # 用户授权平台 (端口: 4002)
pnpm run dev:web-design        # 设计系统展示 (端口: 4000)
pnpm run dev:web-editor        # 编辑器展示 (端口: 4001)

# 构建前端应用
pnpm run build:web-authub
```

#### NestJS 库构建

```bash
# 构建库（编译 + 复制）
pnpm run build:common          # 构建 common 库
pnpm run build:nacos           # 构建 nacos 库

# 仅编译
pnpm run build:nest:common     # 仅编译 common 库
pnpm run build:nest:nacos      # 仅编译 nacos 库

# 复制构建文件
pnpm run copy:common           # 复制到 libs/common/dist
pnpm run copy:nacos            # 复制到 libs/nacos/dist
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

## 📚 使用示例

### 后端库使用

详细使用文档请查看各个库的 README：
- [@meta-1/nest-common](./libs/common/README.md) - 缓存、国际化、错误处理等
- [@meta-1/nest-nacos](./libs/nacos/README.md) - Nacos 配置管理和服务发现

### 前端组件库使用

#### 安装组件库

```bash
# 在你的 Next.js 项目中安装
pnpm add @meta-1/design
# 或
pnpm add @meta-1/editor
```

#### 使用 @meta-1/design 组件

```tsx
import { Button, Dialog, Input } from '@meta-1/design';

export default function MyComponent() {
  return (
    <div>
      <Button>点击我</Button>
      <Input placeholder="输入内容" />
    </div>
  );
}
```

#### 使用 @meta-1/editor 编辑器

```tsx
import { Editor } from '@meta-1/editor';

export default function EditorPage() {
  return (
    <Editor
      content="<p>初始内容</p>"
      onChange={(html) => console.log(html)}
    />
  );
}
```

## 📦 发布库

### 构建和发布 NestJS 库

```bash
# 构建库
pnpm run build:common    # 或 build:nacos

# 进入库目录
cd libs/common           # 或 libs/nacos

# 发布到 npm
npm publish
```

### 发布前端包

```bash
# 前端包通过 workspace 引用，可以直接发布
cd packages/design      # 或 packages/editor
npm publish
```

## 🔧 配置

### 环境变量

在项目根目录创建 `.env` 文件：

```env
# 应用配置
NODE_ENV=development
PORT=3100

# Nacos 配置
NACOS_SERVER=localhost:8848
NACOS_NAMESPACE=public
NACOS_USERNAME=nacos
NACOS_PASSWORD=nacos
NACOS_DATA_ID=app-config
NACOS_GROUP=DEFAULT_GROUP

# Redis 配置（用于缓存）
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

## 🧪 测试

```bash
# 运行单元测试
pnpm run test

# 监听模式运行测试
pnpm run test:watch

# 生成覆盖率报告
pnpm run test:cov
```

## 📖 文档

- [NestJS 通用库文档](./libs/common/README.md)
- [Nacos 集成文档](./libs/nacos/README.md)
- [设计系统文档](./packages/design/README.md)
- [编辑器文档](./packages/editor/README.md)

## 🛠️ 技术栈

### 后端
- **NestJS** - 企业级 Node.js 框架
- **TypeScript** - 类型安全的 JavaScript
- **Redis** - 缓存和会话存储
- **TypeORM** - ORM 框架
- **Nacos** - 配置管理和服务发现

### 前端
- **Next.js 15** - React 应用框架
- **React 19** - UI 库
- **TypeScript** - 类型安全
- **Tailwind CSS** - 原子化 CSS 框架
- **Radix UI** - 无障碍 UI 基础组件
- **Tiptap** - 富文本编辑器框架

### 工具
- **pnpm** - 高效的包管理器
- **Biome** - 快速的代码检查和格式化工具
- **Turbopack** - 极速的打包工具

## 📝 许可证

[MIT Licensed](LICENSE)

## 🤝 贡献

欢迎贡献！请随时提交 Pull Request。

## 📧 支持

如有问题和支持需求，请在仓库中提交 issue。
