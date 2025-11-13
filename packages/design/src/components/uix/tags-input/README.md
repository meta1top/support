# TagsInput 组件

一个功能丰富的标签输入组件，支持添加、删除标签，带有验证、最大数量限制等特性。

## 功能特性

- ✅ 受控/非受控模式
- ✅ 键盘操作（Enter 添加，Backspace 删除）
- ✅ 自定义分隔符（默认逗号）
- ✅ 标签验证
- ✅ 最大标签数量限制
- ✅ 最大标签长度限制
- ✅ 禁止重复标签
- ✅ 自定义标签渲染
- ✅ 完整的事件回调
- ✅ 禁用状态
- ✅ 自定义样式

## 基础用法

```tsx
import { TagsInput } from "@meta-1/design";

function App() {
  const [tags, setTags] = useState<string[]>([]);

  return (
    <TagsInput
      value={tags}
      onChange={setTags}
      placeholder="输入标签后按 Enter..."
    />
  );
}
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| value | `string[]` | - | 受控模式的标签值 |
| defaultValue | `string[]` | `[]` | 非受控模式的默认值 |
| onChange | `(value: string[]) => void` | - | 标签变化回调 |
| placeholder | `string` | - | 输入框占位符 |
| className | `string` | - | 容器类名 |
| inputClassName | `string` | - | 输入框类名 |
| tagClassName | `string` | - | 标签类名 |
| maxTags | `number` | - | 最大标签数量 |
| maxLength | `number` | - | 单个标签最大长度 |
| allowDuplicates | `boolean` | `false` | 是否允许重复标签 |
| separator | `string \| RegExp` | `","` | 分隔符 |
| validate | `(tag: string) => boolean` | - | 标签验证函数 |
| disabled | `boolean` | `false` | 是否禁用 |
| onTagAdd | `(tag: string) => void` | - | 添加标签回调 |
| onTagRemove | `(tag: string) => void` | - | 删除标签回调 |
| renderTag | `(tag: string, index: number, remove: () => void) => ReactNode` | - | 自定义标签渲染 |

## 使用示例

### 最大数量限制

```tsx
<TagsInput
  maxTags={5}
  value={tags}
  onChange={setTags}
  placeholder="最多 5 个标签"
/>
```

### 自定义验证

```tsx
<TagsInput
  validate={(tag) => /^[a-zA-Z0-9]+$/.test(tag)}
  value={tags}
  onChange={setTags}
  placeholder="只允许字母和数字"
/>
```

### 禁止重复

```tsx
<TagsInput
  allowDuplicates={false}
  value={tags}
  onChange={setTags}
  placeholder="不允许重复标签"
/>
```

### 自定义标签渲染

```tsx
<TagsInput
  renderTag={(tag, index, remove) => (
    <div className="custom-tag">
      #{tag}
      <button onClick={remove}>×</button>
    </div>
  )}
  value={tags}
  onChange={setTags}
/>
```

### 事件回调

```tsx
<TagsInput
  onTagAdd={(tag) => console.log("添加:", tag)}
  onTagRemove={(tag) => console.log("删除:", tag)}
  value={tags}
  onChange={setTags}
/>
```

## 键盘操作

- **Enter**: 添加当前输入的标签
- **Backspace**: 当输入框为空时，删除最后一个标签
- **分隔符** (默认逗号): 添加标签

## 样式自定义

组件支持通过 `className`、`inputClassName` 和 `tagClassName` 来自定义样式：

```tsx
<TagsInput
  className="border-primary"
  tagClassName="bg-primary text-primary-foreground"
  inputClassName="text-lg"
/>
```

