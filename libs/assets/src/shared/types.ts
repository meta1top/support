import { StorageProvider } from "./constants";

/**
 * S3 配置
 */
export interface S3Config {
  /** AWS 区域 */
  region: string;
  /** 访问密钥 ID */
  accessKeyId: string;
  /** 访问密钥 Secret */
  secretAccessKey: string;
  /** 自定义端点（可选，用于兼容 S3 的服务） */
  endpoint?: string;
}

/**
 * OSS 配置
 */
export interface OSSConfig {
  /** 阿里云 OSS 区域 */
  region: string;
  /** 访问密钥 ID */
  accessKeyId: string;
  /** 访问密钥 Secret */
  accessKeySecret: string;
}

/**
 * 存储配置
 */
export interface StorageConfig {
  /** 默认存储提供商 */
  provider: StorageProvider;
  /** 公共存储桶名称 */
  publicBucket: string;
  /** 私有存储桶名称 */
  privateBucket: string;
  /** 私桶签名有效期，支持字符串（如 '30m', '1h', '2d'）或数字（毫秒），默认 30 分钟 */
  expiresIn?: string | number;
}

/**
 * Assets 模块配置
 */
export interface AssetsConfig {
  /** 存储配置 */
  storage: StorageConfig;
  /** S3 配置 */
  s3?: S3Config;
  /** OSS 配置 */
  oss?: OSSConfig;
}

// DTO 类已移至 dto 目录
// 这里保留类型导出以保持向后兼容
export type {
  PresignedDownloadUrlRequest,
  PresignedDownloadUrlResponse,
  PresignedUploadUrlRequest,
  PresignedUploadUrlResponse,
} from "./dto";
