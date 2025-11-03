import { Injectable, Logger } from "@nestjs/common";

import { AppError, ErrorCode as CommonErrorCode } from "@meta-1/nest-common";
import { AssetsConfigService } from "./config";
import { OSSService } from "./oss";
import { S3Service } from "./s3";
import {
  type AssetsConfig,
  ErrorCode as AssetsErrorCode,
  type PresignedDownloadUrlRequest,
  type PresignedDownloadUrlResponse,
  type PresignedUploadUrlRequest,
  type PresignedUploadUrlResponse,
  StorageProvider,
} from "./shared";

/**
 * 资源服务
 * 提供统一的资源管理接口，内部根据配置选择 S3 或 OSS
 */
@Injectable()
export class AssetsService {
  private readonly logger = new Logger(AssetsService.name);

  constructor(
    private readonly assetsConfigService: AssetsConfigService,
    private readonly s3Service: S3Service,
    private readonly ossService: OSSService,
  ) {}

  /**
   * 刷新配置
   */
  refresh(config: AssetsConfig) {
    const { storage, s3, oss } = config;
    const expiresIn = storage.expiresIn || "30m"; // 默认 30 分钟

    if (storage.provider === StorageProvider.S3) {
      if (!s3) {
        throw new AppError(CommonErrorCode.CONFIG_INVALID);
      }
      this.s3Service.initialize(s3, storage.publicBucket, storage.privateBucket, expiresIn);
      this.logger.log("已切换到 S3 存储");
    } else if (storage.provider === StorageProvider.OSS) {
      if (!oss) {
        throw new AppError(CommonErrorCode.CONFIG_INVALID);
      }
      this.ossService.initialize(oss, storage.publicBucket, storage.privateBucket, expiresIn);
      this.logger.log("已切换到 OSS 存储");
    } else {
      throw new AppError(AssetsErrorCode.PROVIDER_NOT_SUPPORTED);
    }
  }

  /**
   * 获取当前配置的存储提供商
   */
  private getCurrentProvider(): StorageProvider {
    const config = this.assetsConfigService.get();
    return config.storage.provider;
  }

  /**
   * 生成预签名上传 URL
   */
  async generatePresignedUploadUrl(request: PresignedUploadUrlRequest): Promise<PresignedUploadUrlResponse> {
    const provider = this.getCurrentProvider();

    if (provider === StorageProvider.S3) {
      if (!this.s3Service.isConfigured()) {
        throw new AppError(AssetsErrorCode.S3_NOT_CONFIGURED);
      }
      return this.s3Service.generatePresignedUploadUrl(request);
    } else if (provider === StorageProvider.OSS) {
      if (!this.ossService.isConfigured()) {
        throw new AppError(AssetsErrorCode.OSS_NOT_CONFIGURED);
      }
      return this.ossService.generatePresignedUploadUrl(request);
    }

    throw new AppError(AssetsErrorCode.PROVIDER_NOT_SUPPORTED);
  }

  /**
   * 生成预签名下载 URL（用于私桶）
   */
  async generatePresignedDownloadUrl(request: PresignedDownloadUrlRequest): Promise<PresignedDownloadUrlResponse> {
    const provider = this.getCurrentProvider();

    if (provider === StorageProvider.S3) {
      if (!this.s3Service.isConfigured()) {
        throw new AppError(AssetsErrorCode.S3_NOT_CONFIGURED);
      }
      return this.s3Service.generatePresignedDownloadUrl(request);
    } else if (provider === StorageProvider.OSS) {
      if (!this.ossService.isConfigured()) {
        throw new AppError(AssetsErrorCode.OSS_NOT_CONFIGURED);
      }
      return this.ossService.generatePresignedDownloadUrl(request);
    }

    throw new AppError(AssetsErrorCode.PROVIDER_NOT_SUPPORTED);
  }

  /**
   * 检查服务是否已配置
   */
  isConfigured(): boolean {
    try {
      const config = this.assetsConfigService.get();
      const provider = config.storage.provider;

      if (provider === StorageProvider.S3) {
        return this.s3Service.isConfigured();
      } else if (provider === StorageProvider.OSS) {
        return this.ossService.isConfigured();
      }

      return false;
    } catch {
      return false;
    }
  }
}
