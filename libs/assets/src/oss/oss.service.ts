import { Injectable, Logger } from "@nestjs/common";
import OSS from "ali-oss";
import ms from "ms";

import { AppError } from "@meta-1/nest-common";
import type {
  OSSConfig,
  PresignedDownloadUrlRequest,
  PresignedDownloadUrlResponse,
  PresignedUploadUrlRequest,
  PresignedUploadUrlResponse,
} from "../shared";
import { ErrorCode as AssetsErrorCode, BucketType } from "../shared";

/**
 * OSS 服务
 * 处理阿里云对象存储服务
 */
@Injectable()
export class OSSService {
  private readonly logger = new Logger(OSSService.name);
  private publicClient: OSS | null = null;
  private privateClient: OSS | null = null;
  private config: OSSConfig | null = null;
  private publicBucket: string | null = null;
  private privateBucket: string | null = null;
  private expiresInSeconds = 1800; // 默认 30 分钟（秒）

  /**
   * 初始化 OSS 客户端
   */
  initialize(config: OSSConfig, publicBucket: string, privateBucket: string, expiresIn?: string | number) {
    this.config = config;
    this.publicBucket = publicBucket;
    this.privateBucket = privateBucket;
    if (expiresIn !== undefined) {
      // 将 expiresIn 转换为秒
      const milliseconds = typeof expiresIn === "string" ? ms(expiresIn) : expiresIn;
      this.expiresInSeconds = Math.floor(milliseconds / 1000);
    }

    // 为公共桶创建客户端
    this.publicClient = new OSS({
      region: config.region,
      accessKeyId: config.accessKeyId,
      accessKeySecret: config.accessKeySecret,
      bucket: publicBucket,
    });

    // 为私有桶创建客户端
    this.privateClient = new OSS({
      region: config.region,
      accessKeyId: config.accessKeyId,
      accessKeySecret: config.accessKeySecret,
      bucket: privateBucket,
    });

    this.logger.log(
      `OSS 客户端已初始化: region=${config.region}, publicBucket=${publicBucket}, privateBucket=${privateBucket}`,
    );
  }

  /**
   * 检查是否已初始化
   */
  private ensureInitialized() {
    if (!this.publicClient || !this.privateClient || !this.config || !this.publicBucket || !this.privateBucket) {
      throw new AppError(AssetsErrorCode.OSS_INIT_ERROR);
    }
  }

  /**
   * 根据桶类型获取对应的客户端
   */
  private getClient(bucketType: BucketType): OSS {
    this.ensureInitialized();
    return bucketType === BucketType.PUBLIC ? this.publicClient! : this.privateClient!;
  }

  /**
   * 根据桶类型获取对应的桶名称
   */
  private getBucketName(bucketType: BucketType): string {
    this.ensureInitialized();
    return bucketType === BucketType.PUBLIC ? this.publicBucket! : this.privateBucket!;
  }

  /**
   * 生成文件的完整 Key
   */
  private generateFileKey(fileName: string, bucketType: BucketType, prefix?: string): string {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const fileKey = `${timestamp}_${randomStr}_${fileName}`;

    if (prefix) {
      return `${bucketType}/${prefix}/${fileKey}`;
    }
    return `${bucketType}/${fileKey}`;
  }

  /**
   * 获取文件的公共访问 URL
   */
  private getPublicUrl(fileKey: string, bucketType: BucketType): string {
    this.ensureInitialized();
    const bucket = this.getBucketName(bucketType);
    const { region } = this.config!;

    // 阿里云 OSS 公共访问 URL 格式
    return `https://${bucket}.${region}.aliyuncs.com/${fileKey}`;
  }

  /**
   * 生成预签名上传 URL
   */
  async generatePresignedUploadUrl(request: PresignedUploadUrlRequest): Promise<PresignedUploadUrlResponse> {
    this.ensureInitialized();

    const fileKey = this.generateFileKey(request.fileName, request.bucketType, request.prefix);
    const client = this.getClient(request.bucketType);

    // OSS 签名 URL 用于上传
    const uploadUrl = client.signatureUrl(fileKey, {
      method: "PUT",
      expires: this.expiresInSeconds,
      "Content-Type": request.contentType,
    });

    const fileUrl = request.bucketType === BucketType.PUBLIC ? this.getPublicUrl(fileKey, request.bucketType) : fileKey; // 私桶返回 key，需要时再生成下载 URL

    const expiresAt = Date.now() + this.expiresInSeconds * 1000;

    return {
      uploadUrl,
      fileUrl,
      fileKey,
      expiresAt,
    };
  }

  /**
   * 生成预签名下载 URL（用于私桶）
   */
  async generatePresignedDownloadUrl(request: PresignedDownloadUrlRequest): Promise<PresignedDownloadUrlResponse> {
    this.ensureInitialized();

    // 公桶直接返回公共 URL
    if (request.bucketType === BucketType.PUBLIC) {
      return {
        downloadUrl: this.getPublicUrl(request.fileKey, request.bucketType),
        expiresAt: 0, // 公共 URL 不过期
      };
    }

    // 私桶生成预签名 URL
    const client = this.getClient(request.bucketType);
    const downloadUrl = client.signatureUrl(request.fileKey, {
      method: "GET",
      expires: this.expiresInSeconds,
    });

    const expiresAt = Date.now() + this.expiresInSeconds * 1000;

    return {
      downloadUrl,
      expiresAt,
    };
  }

  /**
   * 获取配置状态
   */
  isConfigured(): boolean {
    return (
      this.publicClient !== null &&
      this.privateClient !== null &&
      this.config !== null &&
      this.publicBucket !== null &&
      this.privateBucket !== null
    );
  }
}
