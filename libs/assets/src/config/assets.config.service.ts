import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { AppError, ErrorCode } from "@meta-1/nest-common";
import { ASSETS_CONFIG, type AssetsConfig } from "../shared";

/**
 * 资源配置服务
 * 用于读取和保存 AssetsModule 的配置
 */
@Injectable()
export class AssetsConfigService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * 保存配置
   */
  set(config: AssetsConfig) {
    this.configService.set(ASSETS_CONFIG, config);
  }

  /**
   * 获取当前配置
   */
  get<T = AssetsConfig>(): T {
    const config = this.configService.get<T>(ASSETS_CONFIG);
    if (!config) {
      throw new AppError(ErrorCode.CONFIG_NOT_FOUND);
    }
    return config;
  }
}
