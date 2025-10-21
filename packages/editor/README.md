# @meta-1/editor - 富文本编辑器

基于 Tiptap 构建的现代化富文本编辑器组件库，提供完整的编辑功能和灵活的扩展系统。

## ✨ 特性

- ✏️ **富文本编辑** - 完整的文本编辑功能
- 🔌 **扩展系统** - 灵活的插件架构，易于扩展
- 🎨 **自定义样式** - 可定制的外观和主题
- 📝 **Markdown 支持** - 支持 Markdown 语法快捷输入
- 🌍 **国际化** - 内置多语言支持（中文、英文）
- 🎯 **类型安全** - 完整的 TypeScript 支持
- 📱 **响应式** - 适配桌面和移动端
- ⚡ **高性能** - 基于 ProseMirror，性能优异
- 🎭 **多种工具栏** - 支持固定工具栏、气泡菜单、斜杠命令

## 📦 安装

```bash
npm install @meta-1/editor
# 或
pnpm add @meta-1/editor
# 或
yarn add @meta-1/editor
```

### 依赖安装

确保安装必要的依赖：

```bash
pnpm add react react-dom @tiptap/react @tiptap/core
```

## 🚀 快速开始

### 基础用法

```tsx
import { Editor } from '@meta-1/editor';

export default function MyEditor() {
  return (
    <Editor
      content="<p>开始编辑...</p>"
      onChange={(html) => console.log(html)}
    />
  );
}
```

### 完整示例

```tsx
import { Editor } from '@meta-1/editor';
import { useState } from 'react';

export default function MyEditor() {
  const [content, setContent] = useState('<p>初始内容</p>');

  return (
    <Editor
      content={content}
      placeholder="输入内容..."
      editable={true}
      onUpdate={({ editor }) => {
        const html = editor.getHTML();
        setContent(html);
      }}
    />
  );
}
```

## 🎨 功能特性

### 文本格式

- **粗体** - `Ctrl/Cmd + B`
- *斜体* - `Ctrl/Cmd + I`
- <u>下划线</u> - `Ctrl/Cmd + U`
- ~~删除线~~ - `Ctrl/Cmd + Shift + X`
- `行内代码` - `Ctrl/Cmd + E`
- 上标和下标

### 段落格式

- 标题 1-6 - `Ctrl/Cmd + Alt + 1-6`
- 引用块 - `Ctrl/Cmd + Shift + B`
- 代码块 - `Ctrl/Cmd + Alt + C`
- 水平分割线

### 列表

- 有序列表 - `Ctrl/Cmd + Shift + 7`
- 无序列表 - `Ctrl/Cmd + Shift + 8`
- 任务列表

### 富媒体

- 图片插入和调整大小
- 链接插入和编辑
- 表格创建和编辑
- 视频嵌入（可选）

### 高级功能

- 文本颜色和背景色
- 文本对齐（左、中、右、两端）
- 字体系列
- 拖拽排序
- 代码高亮（支持多种语言）

## 🔧 配置选项

### Props

```tsx
interface EditorProps {
  // 内容
  content?: string;                    // HTML 或 JSON 格式的内容
  
  // 配置
  placeholder?: string;                 // 占位符文本
  editable?: boolean;                   // 是否可编辑
  extensions?: Extension[];             // 自定义扩展
  
  // 回调
  onUpdate?: (props: { editor: Editor }) => void;
  onChange?: (html: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  
  // 国际化
  locale?: Locale;                      // 语言配置
  
  // 样式
  className?: string;
}
```

### 基础配置

```tsx
<Editor
  content="<p>初始内容</p>"
  placeholder="开始输入..."
  editable={true}
  className="min-h-[300px]"
/>
```

### 自定义扩展

```tsx
import { Editor } from '@meta-1/editor';
import { Mention } from '@tiptap/extension-mention';

<Editor
  extensions={[
    Mention.configure({
      // 配置 @提及 功能
    }),
  ]}
/>
```

## 🌍 国际化

### 使用中文

```tsx
import { Editor } from '@meta-1/editor';
import zhCN from '@meta-1/editor/locales/zh-cn';

<Editor locale={zhCN} />
```

### 使用英文

```tsx
import { Editor } from '@meta-1/editor';
import enUS from '@meta-1/editor/locales/en-us';

<Editor locale={enUS} />
```

### 支持的语言

- 简体中文 (`zh-cn`)
- 繁体中文 (`zh-tw`)
- 英文 (`en-us`)

## 📝 内容格式

### HTML 格式

```tsx
const htmlContent = '<p>Hello <strong>World</strong></p>';

<Editor
  content={htmlContent}
  onChange={(html) => console.log(html)}
/>
```

### JSON 格式

```tsx
const jsonContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Hello World' }]
    }
  ]
};

<Editor
  content={jsonContent}
  onUpdate={({ editor }) => {
    const json = editor.getJSON();
    console.log(json);
  }}
/>
```

## 🎯 常见用例

### 评论编辑器

```tsx
import { Editor } from '@meta-1/editor';

export function CommentEditor() {
  return (
    <Editor
      placeholder="写下你的评论..."
      extensions={[
        // 只启用基础功能
      ]}
      className="min-h-[100px]"
    />
  );
}
```

### 文章编辑器

```tsx
import { Editor } from '@meta-1/editor';

export function ArticleEditor() {
  return (
    <Editor
      placeholder="开始写作..."
      extensions={[
        // 启用所有功能
      ]}
      className="min-h-[500px]"
    />
  );
}
```

### 只读模式

```tsx
<Editor
  content={article.content}
  editable={false}
/>
```

## 🎨 样式定制

### 自定义样式

```tsx
<Editor
  className="my-custom-editor"
  content={content}
/>
```

```css
.my-custom-editor {
  /* 自定义编辑器样式 */
}

.my-custom-editor .ProseMirror {
  /* 自定义编辑区域样式 */
  min-height: 300px;
  padding: 1rem;
}
```

### 主题支持

编辑器自动适配明暗主题：

```tsx
import { ThemeProvider } from 'next-themes';

<ThemeProvider>
  <Editor content={content} />
</ThemeProvider>
```

## 📚 高级功能

### 获取编辑器实例

```tsx
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

function MyEditor() {
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Hello World</p>',
  });

  // 使用编辑器实例
  const getContent = () => {
    const html = editor?.getHTML();
    const json = editor?.getJSON();
    return { html, json };
  };

  return <EditorContent editor={editor} />;
}
```

### 自定义工具栏

```tsx
import { Editor } from '@meta-1/editor';

<Editor
  content={content}
  toolbar={{
    // 自定义工具栏配置
  }}
/>
```

### 图片上传

```tsx
<Editor
  content={content}
  onImageUpload={async (file) => {
    // 上传图片到服务器
    const url = await uploadImage(file);
    return url;
  }}
/>
```

### 协作编辑（可选）

```tsx
import { Editor } from '@meta-1/editor';
import { Collaboration } from '@tiptap/extension-collaboration';

<Editor
  extensions={[
    Collaboration.configure({
      // 配置协作编辑
    }),
  ]}
/>
```

## 🔌 扩展开发

### 创建自定义扩展

```tsx
import { Extension } from '@tiptap/core';

const CustomExtension = Extension.create({
  name: 'customExtension',
  
  addOptions() {
    return {
      // 扩展选项
    };
  },
  
  addCommands() {
    return {
      // 自定义命令
    };
  },
});

<Editor
  extensions={[CustomExtension]}
/>
```

## 📖 API 参考

### Editor 方法

```tsx
// 获取内容
editor.getHTML()          // 获取 HTML 格式
editor.getJSON()          // 获取 JSON 格式
editor.getText()          // 获取纯文本

// 设置内容
editor.commands.setContent(content)

// 命令
editor.commands.toggleBold()
editor.commands.toggleItalic()
editor.commands.setHeading({ level: 1 })
editor.commands.insertContent('<p>Hello</p>')

// 判断状态
editor.isActive('bold')
editor.isActive('heading', { level: 1 })

// 清空内容
editor.commands.clearContent()

// 焦点控制
editor.commands.focus()
editor.commands.blur()
```

## 🧪 测试

```bash
# 运行测试
pnpm test

# 运行测试覆盖率
pnpm test:cov
```

## 🤝 贡献

欢迎贡献代码、报告问题或提出建议！

## 📄 许可证

MIT

## 🔗 相关链接

- [Tiptap 文档](https://tiptap.dev/)
- [ProseMirror](https://prosemirror.net/)
- [示例网站](https://editor.example.com)
