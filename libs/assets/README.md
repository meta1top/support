# @meta-1/nest-assets

NestJS 资源管理模块，支持亚马逊 S3 和阿里云 OSS 对象存储。

## 功能特性

- ✅ 支持亚马逊 S3 和阿里云 OSS
- ✅ 预签名 URL 模式，客户端直传
- ✅ 统一接口，内部自动切换存储提供商
- ✅ 支持私桶和公桶
- ✅ 私桶访问自动签名授权
- ✅ 可配置签名有效期

## 安装

```bash
npm install @meta-1/nest-assets
```

所有必需的依赖（包括 AWS S3 SDK 和阿里云 OSS SDK）会自动安装。

## 使用方法

### 1. 导入模块

```typescript
import { Module } from '@nestjs/common';
import { AssetsModule } from '@meta-1/nest-assets';

@Module({
  imports: [AssetsModule],
})
export class AppModule {}
```

### 2. Nacos 配置

在 Nacos 配置中心添加 `assets` 配置：

```yaml
assets:
  storage:
    # 默认存储提供商: 's3' | 'oss'
    provider: s3
    # 公共存储桶名称（用于存储可公开访问的文件）
    publicBucket: ${PUBLIC_BUCKET}
    # 私有存储桶名称（用于存储需要权限访问的文件）
    privateBucket: ${PRIVATE_BUCKET}
    # 签名有效期，支持字符串（如 '30m', '1h', '2d'）或数字（毫秒），默认 '30m'
    expiresIn: 30m
  
  # S3 配置
  s3:
    region: us-east-1
    accessKeyId: ${AWS_ACCESS_KEY_ID}
    secretAccessKey: ${AWS_SECRET_ACCESS_KEY}
    endpoint: ${AWS_S3_ENDPOINT}  # 可选，用于兼容 S3 的服务
  
  # OSS 配置
  oss:
    region: oss-cn-hangzhou
    accessKeyId: ${ALIYUN_ACCESS_KEY_ID}
    accessKeySecret: ${ALIYUN_ACCESS_KEY_SECRET}
```

### 3. 在业务方创建 Controller

**重要：** AssetsModule 只提供 Service，Controller 需要由业务方实现。这样可以添加权限控制、日志等业务逻辑。

```typescript
// src/controllers/assets.controller.ts
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import {
  AssetsService,
  PresignedUploadUrlRequest,
  PresignedUploadUrlResponse,
  PresignedDownloadUrlRequest,
  PresignedDownloadUrlResponse,
} from '@meta-1/nest-assets';

@ApiTags('Assets')
@Controller('api/assets')
@UseGuards(JwtAuthGuard)  // ✅ 添加权限验证
@ApiBearerAuth()
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post('presigned-upload-url')
  @ApiOperation({ summary: '生成预签名上传 URL' })
  async generatePresignedUploadUrl(
    @Body() request: PresignedUploadUrlRequest
  ): Promise<PresignedUploadUrlResponse> {
    return this.assetsService.generatePresignedUploadUrl(request);
  }

  @Post('presigned-download-url')
  @ApiOperation({ summary: '生成预签名下载 URL' })
  async generatePresignedDownloadUrl(
    @Body() request: PresignedDownloadUrlRequest
  ): Promise<PresignedDownloadUrlResponse> {
    return this.assetsService.generatePresignedDownloadUrl(request);
  }
}
```

然后在 AppModule 中注册：

```typescript
@Module({
  imports: [AssetsModule],
  controllers: [AssetsController],  // ✅ 注册业务方的 Controller
})
export class AppModule {}
```

**更多示例：** 查看 [CONTROLLER_EXAMPLE.md](./CONTROLLER_EXAMPLE.md) 了解如何添加权限控制、日志、限流等功能。

### 4. 在业务代码中使用服务

```typescript
import { Injectable } from '@nestjs/common';
import { AssetsService, BucketType } from '@meta-1/nest-assets';

@Injectable()
export class MyService {
  constructor(private readonly assetsService: AssetsService) {}

  async uploadFile() {
    // 生成预签名上传 URL
    const uploadUrl = await this.assetsService.generatePresignedUploadUrl({
      fileName: 'example.jpg',
      contentType: 'image/jpeg',
      bucketType: BucketType.PUBLIC,  // 或 BucketType.PRIVATE
      prefix: 'images',  // 可选，文件路径前缀
    });

    // 返回给客户端
    return {
      uploadUrl: uploadUrl.uploadUrl,  // 客户端用此 URL 上传文件
      fileUrl: uploadUrl.fileUrl,      // 上传成功后的访问地址
      fileKey: uploadUrl.fileKey,      // 文件唯一标识
      expiresAt: uploadUrl.expiresAt,  // 过期时间
    };
  }

  async downloadFile(fileKey: string) {
    // 生成预签名下载 URL（私桶需要）
    const downloadUrl = await this.assetsService.generatePresignedDownloadUrl({
      fileKey,
      bucketType: BucketType.PRIVATE,
    });

    return downloadUrl;
  }
}
```

### 5. API 请求示例

使用内置的 Controller：

```bash
# 生成上传 URL
POST /assets/presigned-upload-url
Content-Type: application/json

{
  "fileName": "example.jpg",
  "contentType": "image/jpeg",
  "bucketType": "public",
  "prefix": "images"
}

# 生成下载 URL
POST /assets/presigned-download-url
Content-Type: application/json

{
  "fileKey": "private/1234567890_abc_example.jpg",
  "bucketType": "private"
}
```

**注意：** 所有请求参数都会自动进行类型验证，Swagger UI 会显示完整的 Schema 信息。

## 客户端上传示例

```typescript
// 1. 获取预签名上传 URL
const { uploadUrl, fileUrl } = await fetch('/assets/presigned-upload-url', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fileName: 'example.jpg',
    contentType: 'image/jpeg',
    bucketType: 'public',
  }),
}).then(res => res.json());

// 2. 使用预签名 URL 上传文件
await fetch(uploadUrl, {
  method: 'PUT',
  headers: { 'Content-Type': 'image/jpeg' },
  body: fileBlob,
});

// 3. 上传成功后，使用 fileUrl 访问文件
console.log('文件地址:', fileUrl);
```

## 桶类型说明

模块支持两种桶类型，通过 `BucketType` 枚举指定，系统会自动将文件存储到对应的桶中：

- **公桶 (BucketType.PUBLIC)**: 
  - 文件存储到 `storage.publicBucket` 配置的桶中
  - 上传需要签名
  - 访问不需要签名，可直接访问
  - 适用于公开资源（如网站图片、文档等）

- **私桶 (BucketType.PRIVATE)**:
  - 文件存储到 `storage.privateBucket` 配置的桶中
  - 上传需要签名
  - 访问需要签名，有时效性
  - 适用于私密资源（如用户私人文件、敏感数据等）

### 配置示例

```yaml
assets:
  storage:
    provider: s3
    publicBucket: my-public-bucket    # 公共文件存储桶
    privateBucket: my-private-bucket  # 私密文件存储桶
    expiresIn: 30m
```

当调用 API 时指定 `bucketType: "public"` 或 `bucketType: "private"`，文件会自动存储到对应的桶中。

## API 参考

### AssetsService

#### `generatePresignedUploadUrl(request)`

生成预签名上传 URL。

**参数:**
- `fileName`: 文件名
- `contentType`: 文件 MIME 类型
- `bucketType`: 桶类型 (`BucketType.PUBLIC` | `BucketType.PRIVATE`)
- `prefix`: 可选，文件路径前缀

**返回:**
- `uploadUrl`: 预签名上传 URL
- `fileUrl`: 文件访问 URL
- `fileKey`: 文件唯一标识
- `expiresAt`: 过期时间（Unix 时间戳）

#### `generatePresignedDownloadUrl(request)`

生成预签名下载 URL（用于私桶）。

**参数:**
- `fileKey`: 文件唯一标识
- `bucketType`: 桶类型

**返回:**
- `downloadUrl`: 预签名下载 URL
- `expiresAt`: 过期时间（0 表示不过期，仅公桶）

## 许可证

MIT

