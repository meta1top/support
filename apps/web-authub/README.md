# Authub - 统一用户授权平台

基于 Next.js 15 和 React 19 构建的现代化用户授权和管理平台。

## ✨ 特性

- 🔐 **用户认证** - 完整的登录、注册、密码重置流程
- 👤 **用户管理** - 个人资料管理、账号设置
- 🎨 **现代 UI** - 基于 @meta-1/design 组件库，美观易用
- 🌍 **国际化** - 支持多语言切换（中文、英文）
- 🌗 **主题切换** - 明暗主题支持
- 📱 **响应式设计** - 完美适配桌面端和移动端
- ⚡ **高性能** - 使用 Turbopack 打包，极速开发体验
- 🔒 **安全加密** - RSA 加密保护敏感数据
- 🖼️ **图片裁剪** - 内置头像裁剪功能
- 📊 **状态管理** - 使用 Jotai 轻量级状态管理

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 8

### 安装依赖

```bash
# 在项目根目录
pnpm install
```

### 开发模式

```bash
# 启动开发服务器（端口 4002）
pnpm run dev:web-authub
```

访问 http://localhost:4002 查看应用。

### 构建

```bash
# 构建生产版本
pnpm run build:web-authub

# 启动生产服务器
cd apps/web-authub
pnpm start
```

## 📦 技术栈

### 核心框架
- **Next.js 15** - React 应用框架，使用 App Router
- **React 19** - 用户界面库
- **TypeScript** - 类型安全

### UI 组件
- **@meta-1/design** - 内部 UI 组件库
- **Tailwind CSS** - 原子化 CSS 框架
- **next-themes** - 主题切换支持

### 状态和数据
- **Jotai** - 轻量级状态管理
- **TanStack Query** - 数据获取和缓存
- **Axios** - HTTP 客户端
- **nuqs** - URL 查询参数状态管理

### 国际化
- **i18next** - 国际化框架
- **react-i18next** - React i18n 集成
- **i18next-browser-languagedetector** - 自动语言检测

### 工具库
- **JSEncrypt** - RSA 加密
- **Cropper.js** - 图片裁剪
- **js-cookie** - Cookie 操作
- **input-otp** - OTP 输入组件
- **es-toolkit** - 现代工具库

## 🗂️ 项目结构

```
apps/web-authub/
├── src/
│   ├── app/                    # Next.js App Router 页面
│   │   ├── (auth)/            # 认证相关页面
│   │   ├── (dashboard)/       # 仪表板页面
│   │   ├── layout.tsx         # 根布局
│   │   └── page.tsx           # 首页
│   ├── components/            # React 组件
│   │   ├── layout/           # 布局组件
│   │   ├── auth/             # 认证组件
│   │   └── ...
│   ├── hooks/                 # 自定义 Hooks
│   ├── rest/                  # API 请求
│   ├── state/                 # 状态管理
│   ├── types/                 # TypeScript 类型定义
│   ├── utils/                 # 工具函数
│   ├── config/                # 配置文件
│   ├── schema/                # 数据模式验证
│   └── middleware.ts          # Next.js 中间件
├── public/                    # 静态资源
│   ├── assets/               # 图片资源
│   └── ...
├── next.config.ts            # Next.js 配置
├── tsconfig.json             # TypeScript 配置
└── package.json              # 依赖配置
```

## 🎨 主要功能

### 用户认证
- 用户登录（支持邮箱/用户名）
- 用户注册
- 密码重置
- OTP 二次验证
- 会话管理

### 用户管理
- 个人资料编辑
- 头像上传和裁剪
- 账号设置
- 密码修改
- 安全设置

### UI 功能
- 响应式导航
- 侧边栏导航
- 面包屑导航
- 表单验证
- 加载状态
- 错误处理
- Toast 通知

## 🔧 配置

### 环境变量

创建 `.env.local` 文件：

```env
# API 基础地址
NEXT_PUBLIC_API_URL=http://localhost:3100

# 公钥配置（用于 RSA 加密）
NEXT_PUBLIC_RSA_PUBLIC_KEY=your-public-key
```

### API 配置

在 `src/config/` 目录配置 API 端点和请求拦截器。

## 🌍 国际化

支持多语言配置，语言文件位于组件内部或通过 i18next 配置。

切换语言：
```typescript
import { useTranslation } from 'react-i18next';

const { t, i18n } = useTranslation();
i18n.changeLanguage('zh-CN'); // 或 'en'
```

## 📝 开发规范

- 使用 TypeScript 进行类型定义
- 遵循 ESLint 和 Prettier 规范
- 组件使用函数式组件和 Hooks
- 使用 TanStack Query 管理服务端状态
- 使用 Jotai 管理客户端状态
- 样式使用 Tailwind CSS

## 🧪 测试

```bash
# 运行测试
pnpm test

# 运行测试覆盖率
pnpm test:cov
```

## 📄 许可证

MIT
