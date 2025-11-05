# @meta-1/nest-types

共享类型定义和 Zod Schema，用于前后端类型共享和数据验证。

## ✨ 特性

- 🛡️ **类型安全** - 完整的 TypeScript 类型定义
- ✅ **数据验证** - 基于 Zod 的 Schema 验证
- 🔄 **共享复用** - 前后端共享类型定义
- 📝 **自动推导** - 从 Schema 自动推导 TypeScript 类型
- 🌍 **国际化** - 支持多语言错误消息
- 🎯 **类型检查** - 编译时类型检查

## 📦 安装

```bash
npm install @meta-1/nest-types
# 或
pnpm add @meta-1/nest-types
# 或
yarn add @meta-1/nest-types
```

### 依赖安装

```bash
npm install zod
```

## 🚀 使用

### 1. 导入类型和 Schema

```typescript
import { MailCodeSchema, MailCodeType } from '@meta-1/nest-types';
```

### 2. 在后端使用（NestJS）

#### DTO 验证

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { MailCodeSchema, MailCodeType } from '@meta-1/nest-types';

@Controller('mail')
export class MailController {
  @Post('send-code')
  async sendCode(@Body() dto: MailCodeType) {
    // DTO 已经通过 Zod 验证
    return await this.mailService.sendCode(dto);
  }
}
```

#### 使用 nestjs-zod 集成

```typescript
import { createZodDto } from 'nestjs-zod';
import { MailCodeSchema } from '@meta-1/nest-types';

// 创建 DTO 类
export class SendMailCodeDto extends createZodDto(MailCodeSchema) {}

@Controller('mail')
export class MailController {
  @Post('send-code')
  async sendCode(@Body() dto: SendMailCodeDto) {
    // 自动验证
    return await this.mailService.sendCode(dto);
  }
}
```

### 3. 在前端使用（Next.js/React）

#### 表单验证

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MailCodeSchema, MailCodeType } from '@meta-1/nest-types';

export function SendCodeForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MailCodeType>({
    resolver: zodResolver(MailCodeSchema),
  });

  const onSubmit = async (data: MailCodeType) => {
    // 数据已验证
    await fetch('/api/mail/send-code', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      
      <input {...register('action')} />
      {errors.action && <span>{errors.action.message}</span>}
      
      <button type="submit">发送验证码</button>
    </form>
  );
}
```

#### API 调用

```typescript
import { MailCodeSchema, MailCodeType } from '@meta-1/nest-types';

async function sendVerificationCode(email: string, action: string) {
  // 验证数据
  const validatedData = MailCodeSchema.parse({
    email,
    action,
  });

  // 发送请求
  const response = await fetch('/api/mail/send-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validatedData),
  });

  return response.json();
}
```

## 📝 内置类型和 Schema

### MailCodeSchema

邮件验证码 Schema。

```typescript
import { z } from 'zod';

export const MailCodeSchema = z.object({
  email: z.string().email('Invalid email format'),
  action: z.enum(['register', 'login', 'reset-password', 'verify-email']),
  lang?: z.enum(['en', 'zh-CN']).optional(),
});

export type MailCodeType = z.infer<typeof MailCodeSchema>;
```

**使用示例：**

```typescript
import { MailCodeSchema } from '@meta-1/nest-types';

// 验证数据
const result = MailCodeSchema.safeParse({
  email: 'user@example.com',
  action: 'register',
  lang: 'zh-CN',
});

if (result.success) {
  console.log('Valid data:', result.data);
} else {
  console.log('Validation errors:', result.error.errors);
}
```

## 🔧 创建自定义 Schema

### 基础 Schema

```typescript
import { z } from 'zod';

// 定义 Schema
export const UserSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(3).max(20),
  email: z.string().email(),
  age: z.number().min(0).max(150).optional(),
  role: z.enum(['admin', 'user', 'guest']),
  createdAt: z.date(),
});

// 自动推导类型
export type User = z.infer<typeof UserSchema>;
```

### 嵌套 Schema

```typescript
import { z } from 'zod';

export const AddressSchema = z.object({
  street: z.string(),
  city: z.string(),
  country: z.string(),
  zipCode: z.string(),
});

export const UserWithAddressSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
  address: AddressSchema,
});

export type UserWithAddress = z.infer<typeof UserWithAddressSchema>;
```

### 联合类型

```typescript
import { z } from 'zod';

export const PaymentMethodSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('credit_card'),
    cardNumber: z.string(),
    expiryDate: z.string(),
    cvv: z.string(),
  }),
  z.object({
    type: z.literal('paypal'),
    email: z.string().email(),
  }),
  z.object({
    type: z.literal('bank_transfer'),
    accountNumber: z.string(),
    bankCode: z.string(),
  }),
]);

export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
```

## 🌍 国际化支持

### 使用 zod-i18n-map

```typescript
import { z } from 'zod';
import { zodI18nMap } from 'zod-i18n-map';
import i18next from 'i18next';

// 配置 i18n
i18next.init({
  lng: 'zh-CN',
  resources: {
    'zh-CN': { zod: require('zod-i18n-map/locales/zh-CN/zod.json') },
    en: { zod: require('zod-i18n-map/locales/en/zod.json') },
  },
});

// 使用 i18n 错误消息
z.setErrorMap(zodI18nMap);

// 现在验证错误消息会自动翻译
const schema = z.string().email();
const result = schema.safeParse('invalid-email');
console.log(result.error?.errors[0].message); // "无效的电子邮件"
```

### 自定义错误消息

```typescript
import { z } from 'zod';

export const UserSchema = z.object({
  username: z.string()
    .min(3, { message: '用户名至少 3 个字符' })
    .max(20, { message: '用户名最多 20 个字符' }),
  email: z.string()
    .email({ message: '请输入有效的邮箱地址' }),
  password: z.string()
    .min(8, { message: '密码至少 8 个字符' })
    .regex(/[A-Z]/, { message: '密码必须包含大写字母' })
    .regex(/[a-z]/, { message: '密码必须包含小写字母' })
    .regex(/[0-9]/, { message: '密码必须包含数字' }),
});
```

## 🎯 高级用法

### 条件验证

```typescript
import { z } from 'zod';

export const OrderSchema = z.object({
  type: z.enum(['digital', 'physical']),
  shippingAddress: z.string().optional(),
}).refine(
  (data) => data.type !== 'physical' || data.shippingAddress !== undefined,
  {
    message: '实体商品必须提供配送地址',
    path: ['shippingAddress'],
  }
);
```

### 数据转换

```typescript
import { z } from 'zod';

export const DateSchema = z.string().transform((val) => new Date(val));

export const UserSchema = z.object({
  id: z.string(),
  createdAt: DateSchema,
  updatedAt: DateSchema,
});

// 自动将字符串转换为 Date 对象
const result = UserSchema.parse({
  id: '123',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-02T00:00:00Z',
});

console.log(result.createdAt instanceof Date); // true
```

### Partial 和 Pick

```typescript
import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
  password: z.string(),
});

// 创建部分更新 Schema
export const UpdateUserSchema = UserSchema.partial();

// 只选择特定字段
export const UserProfileSchema = UserSchema.pick({
  id: true,
  username: true,
  email: true,
});

// 排除特定字段
export const UserWithoutPasswordSchema = UserSchema.omit({
  password: true,
});
```

## 📚 最佳实践

1. **单一职责** - 每个 Schema 只负责一种数据结构
2. **复用 Schema** - 通过组合基础 Schema 创建复杂 Schema
3. **明确错误消息** - 提供清晰的验证错误提示
4. **类型导出** - 始终导出 Schema 和对应的 TypeScript 类型
5. **验证边界** - 在数据进入系统的边界进行验证
6. **前后端共享** - 确保前后端使用相同的验证规则
7. **性能考虑** - 对于复杂验证，考虑使用 `.safeParse()` 而不是 `.parse()`

## 📖 API 参考

### Zod 常用方法

```typescript
// 基础类型
z.string()
z.number()
z.boolean()
z.date()
z.undefined()
z.null()
z.array(z.string())
z.object({ ... })
z.enum(['a', 'b', 'c'])

// 验证方法
schema.parse(data)        // 验证并返回数据，失败抛出错误
schema.safeParse(data)    // 验证并返回 { success, data, error }
schema.parseAsync(data)   // 异步验证

// 转换
schema.transform((val) => ...)
schema.default(defaultValue)
schema.optional()
schema.nullable()

// 细化
schema.refine((val) => ..., { message: '...' })
```

## 📄 许可证

MIT

## 🤝 贡献

欢迎贡献！请随时提交 Pull Request。

