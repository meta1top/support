/**
 * Assets 配置在 Nacos 中的键名
 */
export const ASSETS_CONFIG_KEY = "assets";

/**
 * Assets 配置在 ConfigService 中的键名
 */
export const ASSETS_CONFIG = "ASSETS_CONFIG";

/**
 * 存储提供商类型
 */
export enum StorageProvider {
  S3 = "s3",
  OSS = "oss",
}

/**
 * 桶类型
 */
export enum BucketType {
  /** 私有桶 - 需要签名访问 */
  PRIVATE = "private",
  /** 公共桶 - 可直接访问 */
  PUBLIC = "public",
}
