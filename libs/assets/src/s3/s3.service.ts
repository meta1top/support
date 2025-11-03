import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Injectable, Logger } from "@nestjs/common";
import ms from "ms";

import { AppError } from "@meta-1/nest-common";
import type {
  PresignedDownloadUrlRequest,
  PresignedDownloadUrlResponse,
  PresignedUploadUrlRequest,
  PresignedUploadUrlResponse,
  S3Config,
} from "../shared";
import { ErrorCode as AssetsErrorCode, BucketType } from "../shared";

/**
 * S3 服务
 * 处理 Amazon S3 或兼容 S3 的对象存储服务
 */
@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private client: S3Client | null = null;
  private config: S3Config | null = null;
  private publicBucket: string | null = null;
  private privateBucket: string | null = null;
  private expiresInSeconds = 1800; // 默认 30 分钟（秒）

  /**
   * 初始化 S3 客户端
   */
  initialize(config: S3Config, publicBucket: string, privateBucket: string, expiresIn?: string | number) {
    this.config = config;
    this.publicBucket = publicBucket;
    this.privateBucket = privateBucket;
    if (expiresIn !== undefined) {
      // 将 expiresIn 转换为秒
      const milliseconds = typeof expiresIn === "string" ? ms(expiresIn) : expiresIn;
      this.expiresInSeconds = Math.floor(milliseconds / 1000);
    }

    const clientConfig: {
      region: string;
      credentials: {
        accessKeyId: string;
        secretAccessKey: string;
      };
      endpoint?: string;
      forcePathStyle?: boolean;
    } = {
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    };

    if (config.endpoint) {
      clientConfig.endpoint = config.endpoint;
      clientConfig.forcePathStyle = true; // 兼容性设置
    }

    this.client = new S3Client(clientConfig);
    this.logger.log(
      `S3 客户端已初始化: region=${config.region}, publicBucket=${publicBucket}, privateBucket=${privateBucket}`,
    );
  }

  /**
   * 检查是否已初始化
   */
  private ensureInitialized() {
    if (!this.client || !this.config || !this.publicBucket || !this.privateBucket) {
      throw new AppError(AssetsErrorCode.S3_INIT_ERROR);
    }
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
    const { region, endpoint } = this.config!;

    if (endpoint) {
      // 使用自定义端点
      return `${endpoint}/${bucket}/${fileKey}`;
    }

    // 使用 AWS S3 标准 URL
    return `https://${bucket}.s3.${region}.amazonaws.com/${fileKey}`;
  }

  /**
   * 生成预签名上传 URL
   */
  async generatePresignedUploadUrl(request: PresignedUploadUrlRequest): Promise<PresignedUploadUrlResponse> {
    this.ensureInitialized();

    const fileKey = this.generateFileKey(request.fileName, request.bucketType, request.prefix);
    const bucket = this.getBucketName(request.bucketType);

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: fileKey,
      ContentType: request.contentType,
    });

    const uploadUrl = await getSignedUrl(this.client!, command, {
      expiresIn: this.expiresInSeconds,
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
    const bucket = this.getBucketName(request.bucketType);
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: request.fileKey,
    });

    const downloadUrl = await getSignedUrl(this.client!, command, {
      expiresIn: this.expiresInSeconds,
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
    return this.client !== null && this.config !== null && this.publicBucket !== null && this.privateBucket !== null;
  }
}
