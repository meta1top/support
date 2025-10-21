# Web Design - 设计系统展示平台

基于 Next.js 15 构建的设计系统展示和测试平台，用于展示 @meta-1/design 组件库的所有组件和功能。

## ✨ 特性

- 📚 **组件展示** - 展示所有 @meta-1/design UI 组件
- 🎨 **主题切换** - 明暗主题实时切换
- 📱 **响应式设计** - 适配各种屏幕尺寸
- 🎯 **交互演示** - 实时组件交互示例
- 📖 **使用文档** - 每个组件的使用说明和代码示例
- ⚡ **快速开发** - 使用 Turbopack 获得极速开发体验
- 🔍 **代码预览** - 查看组件源代码和使用方式

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
# 启动开发服务器（端口 4000）
pnpm run dev:web-design
```

访问 http://localhost:4000 查看应用。

### 构建

```bash
# 构建生产版本
pnpm run build

# 启动生产服务器
cd apps/web-design
pnpm start
```

## 📦 技术栈

- **Next.js 15** - React 应用框架
- **React 19** - 用户界面库
- **TypeScript** - 类型安全
- **@meta-1/design** - UI 组件库
- **Tailwind CSS** - 原子化 CSS 框架
- **next-themes** - 主题切换支持
- **Turbopack** - 极速打包工具

## 🗂️ 项目结构

```
apps/web-design/
├── src/
│   ├── app/                    # Next.js App Router 页面
│   │   ├── components/        # 组件展示页面
│   │   ├── layout.tsx         # 根布局
│   │   └── page.tsx           # 首页
│   ├── components/            # React 组件
│   └── assets/                # 静态资源
├── public/                    # 公共静态文件
├── next.config.ts            # Next.js 配置
├── tsconfig.json             # TypeScript 配置
└── package.json              # 依赖配置
```

## 🎨 展示的组件类别

### 基础组件
- Button - 按钮
- Input - 输入框
- Checkbox - 复选框
- Radio - 单选框
- Switch - 开关
- Select - 选择器

### 布局组件
- Card - 卡片
- Dialog - 对话框
- Drawer - 抽屉
- Tabs - 标签页
- Accordion - 手风琴

### 数据展示
- Table - 表格
- Tree - 树形控件
- Badge - 徽章
- Avatar - 头像
- Progress - 进度条

### 反馈组件
- Toast - 消息提示
- Alert - 警告提示
- Loading - 加载状态

### 导航组件
- Menu - 菜单
- Breadcrumb - 面包屑
- Pagination - 分页

## 🔧 配置

### 主题配置

应用支持明暗主题切换，配置位于 `src/app/layout.tsx`。

### Tailwind 配置

自定义 Tailwind 配置可以修改主题颜色、间距等，参考 @meta-1/design 的主题系统。

## 📝 开发指南

### 添加新的组件展示

1. 在 `src/app/components/` 创建新页面
2. 导入要展示的组件
3. 编写使用示例和说明
4. 添加到导航菜单

### 示例代码

```tsx
import { Button } from '@meta-1/design';

export default function ButtonDemo() {
  return (
    <div className="space-y-4">
      <h1>Button 按钮</h1>
      
      <section>
        <h2>基础用法</h2>
        <Button>默认按钮</Button>
        <Button variant="primary">主要按钮</Button>
        <Button variant="outline">边框按钮</Button>
      </section>
      
      <section>
        <h2>尺寸</h2>
        <Button size="sm">小按钮</Button>
        <Button size="md">中按钮</Button>
        <Button size="lg">大按钮</Button>
      </section>
    </div>
  );
}
```

## 🌍 最佳实践

- 每个组件展示页面应包含完整的使用示例
- 提供不同状态和变体的展示
- 添加交互式演示，让用户可以操作
- 包含代码示例和 Props 说明
- 考虑移动端和桌面端的展示效果

## 📄 许可证

MIT
