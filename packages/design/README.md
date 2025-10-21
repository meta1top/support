# @meta-1/design - React UI 组件库

基于 Radix UI 和 Tailwind CSS 构建的现代化 React 组件库，提供美观、易用、无障碍的 UI 组件。

## ✨ 特性

- 🎨 **现代设计** - 美观、简洁的视觉设计
- ♿ **无障碍访问** - 符合 WCAG 标准，基于 Radix UI
- 🎯 **类型安全** - 完整的 TypeScript 支持
- 🌗 **主题系统** - 支持明暗主题切换
- 📦 **模块化** - 按需导入，减小包体积
- 🎭 **灵活定制** - 基于 Tailwind CSS，易于定制
- 🔧 **工具齐全** - 内置表单、表格、树形控件等常用组件
- 🌍 **国际化** - 内置多语言支持

## 📦 安装

```bash
npm install @meta-1/design
# 或
pnpm add @meta-1/design
# 或
yarn add @meta-1/design
```

### 依赖安装

确保安装必要的依赖：

```bash
pnpm add react react-dom next tailwindcss
```

## 🚀 快速开始

### 1. 配置 Tailwind CSS

在你的 `tailwind.config.js` 中：

```js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@meta-1/design/**/*.{js,ts,jsx,tsx}',
  ],
  // ... 其他配置
}
```

### 2. 导入主题样式

在你的应用入口文件中导入主题样式：

```tsx
import '@meta-1/design/theme.css';
```

### 3. 使用组件

```tsx
import { Button, Input, Card } from '@meta-1/design';

export default function App() {
  return (
    <Card>
      <h1>欢迎使用 @meta-1/design</h1>
      <Input placeholder="输入内容" />
      <Button>提交</Button>
    </Card>
  );
}
```

## 📚 组件列表

### 基础组件

#### Button - 按钮
```tsx
import { Button } from '@meta-1/design';

<Button variant="primary">主要按钮</Button>
<Button variant="outline">边框按钮</Button>
<Button variant="ghost">幽灵按钮</Button>
<Button size="sm">小按钮</Button>
```

#### Input - 输入框
```tsx
import { Input } from '@meta-1/design';

<Input placeholder="请输入" />
<Input type="password" />
<Input disabled />
```

#### Checkbox - 复选框
```tsx
import { Checkbox } from '@meta-1/design';

<Checkbox>记住我</Checkbox>
<Checkbox checked>已选中</Checkbox>
```

#### Radio - 单选框
```tsx
import { RadioGroup, RadioGroupItem } from '@meta-1/design';

<RadioGroup>
  <RadioGroupItem value="1">选项 1</RadioGroupItem>
  <RadioGroupItem value="2">选项 2</RadioGroupItem>
</RadioGroup>
```

#### Switch - 开关
```tsx
import { Switch } from '@meta-1/design';

<Switch />
<Switch checked />
```

#### Select - 选择器
```tsx
import { Select, SelectTrigger, SelectContent, SelectItem } from '@meta-1/design';

<Select>
  <SelectTrigger>选择选项</SelectTrigger>
  <SelectContent>
    <SelectItem value="1">选项 1</SelectItem>
    <SelectItem value="2">选项 2</SelectItem>
  </SelectContent>
</Select>
```

### 布局组件

#### Card - 卡片
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@meta-1/design';

<Card>
  <CardHeader>
    <CardTitle>标题</CardTitle>
  </CardHeader>
  <CardContent>
    内容
  </CardContent>
</Card>
```

#### Dialog - 对话框
```tsx
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from '@meta-1/design';

<Dialog>
  <DialogTrigger>打开对话框</DialogTrigger>
  <DialogContent>
    <DialogTitle>标题</DialogTitle>
    <p>内容</p>
  </DialogContent>
</Dialog>
```

#### Tabs - 标签页
```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@meta-1/design';

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">标签 1</TabsTrigger>
    <TabsTrigger value="tab2">标签 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">内容 1</TabsContent>
  <TabsContent value="tab2">内容 2</TabsContent>
</Tabs>
```

### 数据展示

#### Table - 表格
```tsx
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@meta-1/design';

<Table>
  <TableHeader>
    <TableRow>
      <TableCell>列 1</TableCell>
      <TableCell>列 2</TableCell>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>数据 1</TableCell>
      <TableCell>数据 2</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

#### Tree - 树形控件
```tsx
import { Tree } from '@meta-1/design';

<Tree
  data={[
    { key: '1', title: '节点 1', children: [...] }
  ]}
/>
```

#### Badge - 徽章
```tsx
import { Badge } from '@meta-1/design';

<Badge>徽章</Badge>
<Badge variant="success">成功</Badge>
<Badge variant="error">错误</Badge>
```

#### Avatar - 头像
```tsx
import { Avatar, AvatarImage, AvatarFallback } from '@meta-1/design';

<Avatar>
  <AvatarImage src="/avatar.jpg" />
  <AvatarFallback>UN</AvatarFallback>
</Avatar>
```

### 反馈组件

#### Toast - 消息提示
```tsx
import { useToast } from '@meta-1/design';

const { toast } = useToast();

toast({
  title: '成功',
  description: '操作已完成',
});
```

#### Alert - 警告提示
```tsx
import { Alert, AlertTitle, AlertDescription } from '@meta-1/design';

<Alert>
  <AlertTitle>提示</AlertTitle>
  <AlertDescription>这是一条提示信息</AlertDescription>
</Alert>
```

#### Progress - 进度条
```tsx
import { Progress } from '@meta-1/design';

<Progress value={60} />
```

### 导航组件

#### Menu - 菜单
```tsx
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@meta-1/design';

<DropdownMenu>
  <DropdownMenuTrigger>菜单</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>选项 1</DropdownMenuItem>
    <DropdownMenuItem>选项 2</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

## 🎨 主题定制

### 使用主题

```tsx
import { ThemeProvider } from 'next-themes';

<ThemeProvider attribute="class" defaultTheme="system">
  <App />
</ThemeProvider>
```

### 切换主题

```tsx
import { useTheme } from 'next-themes';

const { theme, setTheme } = useTheme();

<button onClick={() => setTheme('dark')}>深色模式</button>
<button onClick={() => setTheme('light')}>浅色模式</button>
```

### 自定义颜色

在你的 CSS 文件中覆盖 CSS 变量：

```css
:root {
  --primary: 220 90% 56%;
  --secondary: 220 14% 96%;
  /* ... 更多变量 */
}

.dark {
  --primary: 220 90% 56%;
  --secondary: 220 14% 20%;
  /* ... 更多变量 */
}
```

## 📖 高级用法

### 表单集成

与 React Hook Form 集成：

```tsx
import { useForm } from 'react-hook-form';
import { Input, Button } from '@meta-1/design';

export default function Form() {
  const { register, handleSubmit } = useForm();

  const onSubmit = (data) => console.log(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register('name')} placeholder="姓名" />
      <Button type="submit">提交</Button>
    </form>
  );
}
```

### 表格高级功能

使用 TanStack Table：

```tsx
import { useReactTable } from '@tanstack/react-table';
import { Table } from '@meta-1/design';

// 完整示例请参考文档
```

## 🌍 国际化

```tsx
import zhCN from '@meta-1/design/locales/zh-cn';
import enUS from '@meta-1/design/locales/en-us';

// 使用你的 i18n 配置
```

## 🔧 工具函数

### cn - 类名合并

```tsx
import { cn } from '@meta-1/design/lib';

<div className={cn('base-class', condition && 'conditional-class')} />
```

## 📝 开发指南

### 项目结构

```
packages/design/
├── src/
│   ├── components/
│   │   ├── ui/           # 基础 UI 组件
│   │   ├── uix/          # 复杂组件
│   │   └── icons/        # 图标组件
│   ├── lib/              # 工具函数
│   ├── hooks/            # 自定义 Hooks
│   └── assets/           # 样式和资源
└── package.json
```

### 按需导入

```tsx
// 推荐：按需导入
import { Button } from '@meta-1/design';
import { Input } from '@meta-1/design';

// 或者从子路径导入
import { Button } from '@meta-1/design/components/ui/button';
```

## 🤝 贡献

欢迎贡献代码、报告问题或提出建议！

## 📄 许可证

MIT

## 🔗 相关链接

- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [示例网站](https://design.example.com)
