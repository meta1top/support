import { Injectable, Logger } from "@nestjs/common";

import { type CommonConfig } from "../shared";
import { CommonConfigService } from "./common.config.service";

/**
 * 消息刷新服务
 * 用于动态更新 MessageModule 的配置
 */
@Injectable()
export class CommonRefreshService {
  private readonly logger = new Logger(CommonRefreshService.name);

  constructor(private readonly commonConfigService: CommonConfigService) {}

  /**
   * 刷新配置
   * @param config 新的配置
   */
  async refresh(config: CommonConfig): Promise<void> {
    this.logger.log("Refreshing common configuration...");
    try {
      // 1. 保存新配置到 ConfigService
      this.commonConfigService.set(config);
      this.logger.log("Common configuration refreshed successfully");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      this.logger.error(`Failed to refresh common configuration: ${errorMessage}`, error);
      throw error;
    }
  }
}
