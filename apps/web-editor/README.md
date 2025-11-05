# Web Editor - 富文本编辑器展示平台

基于 Next.js 16 构建的富文本编辑器展示和测试平台，用于展示 @meta-1/editor 编辑器组件的功能和特性。

## ✨ 特性

- ✏️ **编辑器展示** - 展示 @meta-1/editor 的所有功能
- 🎨 **主题切换** - 明暗主题实时切换
- 📱 **响应式设计** - 适配各种屏幕尺寸
- 🎯 **功能演示** - 各种编辑器扩展和功能的交互演示
- 📖 **使用文档** - 编辑器的使用说明和代码示例
- ⚡ **快速开发** - 使用 Turbopack 获得极速开发体验
- 🔍 **实时预览** - 实时查看编辑结果

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
# 启动开发服务器（端口 4001）
pnpm run dev:web-editor
```

访问 http://localhost:4001 查看应用。

### 构建

```bash
# 构建生产版本
pnpm run build

# 启动生产服务器
cd apps/web-editor
pnpm start
```

## 📦 技术栈

- **Next.js 16** - React 应用框架
- **React 19** - 用户界面库
- **TypeScript 5** - 类型安全
- **@meta-1/editor** - 富文本编辑器组件库
- **@meta-1/design** - UI 组件库
- **Tiptap** - 编辑器框架
- **ProseMirror** - 编辑器核心
- **Tailwind CSS 4** - 原子化 CSS 框架
- **next-themes** - 主题切换支持

## 🗂️ 项目结构

```
apps/web-editor/
├── src/
│   ├── app/                    # Next.js App Router 页面
│   │   ├── examples/          # 示例页面
│   │   ├── layout.tsx         # 根布局
│   │   └── page.tsx           # 首页
│   ├── components/            # React 组件
│   └── assets/                # 静态资源
├── public/                    # 公共静态文件
├── next.config.ts            # Next.js 配置
├── tsconfig.json             # TypeScript 配置
└── package.json              # 依赖配置
```

## ✏️ 编辑器功能

### 基础功能
- 文本格式化（粗体、斜体、下划线、删除线）
- 标题（H1-H6）
- 段落和换行
- 引用块
- 代码块和行内代码

### 列表功能
- 有序列表
- 无序列表
- 任务列表

### 富媒体
- 图片插入和调整
- 链接插入和编辑
- 表格创建和编辑
- 水平分割线

### 高级功能
- 文本颜色和背景色
- 文本对齐（左、中、右、两端）
- 上标和下标
- 代码高亮
- Markdown 支持
- 拖拽排序
- 协作编辑（可选）

### 工具栏
- 气泡菜单（选中文本时显示）
- 固定工具栏
- 斜杠命令（输入 / 触发）
- 字符计数
- 占位符提示

## 🎨 使用示例

### 基础编辑器

```tsx
import { Editor } from '@meta-1/editor';

export default function BasicEditor() {
  return (
    <Editor
      content="<p>开始编辑...</p>"
      onChange={(html) => console.log(html)}
    />
  );
}
```

### 自定义配置

```tsx
import { Editor } from '@meta-1/editor';

export default function CustomEditor() {
  return (
    <Editor
      content=""
      placeholder="输入内容..."
      editable={true}
      extensions={[
        // 自定义扩展
      ]}
      onUpdate={({ editor }) => {
        const html = editor.getHTML();
        const json = editor.getJSON();
        console.log({ html, json });
      }}
    />
  );
}
```

## 🔧 配置

### 编辑器配置

可以通过 props 配置编辑器的各种选项：

- `content` - 初始内容（HTML 或 JSON）
- `placeholder` - 占位符文本
- `editable` - 是否可编辑
- `extensions` - 自定义扩展
- `onUpdate` - 内容更新回调
- `onChange` - 内容改变回调

### 主题配置

编辑器支持明暗主题，自动适配应用主题。

## 🌍 国际化

编辑器内置多语言支持：
- 简体中文（zh-CN）
- 繁体中文（zh-TW）
- 英文（en-US）

```tsx
import { Editor } from '@meta-1/editor';
import zhCN from '@meta-1/editor/locales/zh-cn';

<Editor locale={zhCN} />
```

## 📝 开发指南

### 添加新的扩展

1. 创建扩展文件
2. 实现 Tiptap 扩展接口
3. 注册到编辑器配置

### 自定义样式

可以通过 Tailwind CSS 或自定义 CSS 覆盖默认样式。

## 🎯 最佳实践

- 根据使用场景选择合适的扩展
- 合理使用工具栏和气泡菜单
- 考虑内容的存储格式（HTML 或 JSON）
- 处理图片上传和存储
- 注意移动端的用户体验
- 实现自动保存功能

## 📄 许可证

MIT
