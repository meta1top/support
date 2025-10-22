import { Injectable, Logger } from "@nestjs/common";

import { MailService } from "../mail";
import { type MessageConfig } from "../shared";
import { MessageConfigService } from "./message.config.service";

/**
 * 消息刷新服务
 * 用于动态更新 MessageModule 的配置
 */
@Injectable()
export class MessageRefreshService {
  private readonly logger = new Logger(MessageRefreshService.name);

  constructor(
    private readonly messageConfigService: MessageConfigService,
    private readonly mailService: MailService,
  ) {}

  /**
   * 刷新配置
   * @param config 新的配置
   */
  async refresh(config: MessageConfig): Promise<void> {
    this.logger.log("Refreshing message configuration...");
    try {
      // 1. 保存新配置到 ConfigService
      this.messageConfigService.set(config);

      // 2. 刷新 MailService
      await this.mailService.refresh(config);

      this.logger.log("Message configuration refreshed successfully");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      this.logger.error(`Failed to refresh message configuration: ${errorMessage}`, error);
      throw error;
    }
  }
}
