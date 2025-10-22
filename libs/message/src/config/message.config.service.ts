import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { MESSAGE_CONFIG, type MessageConfig } from "../shared";

/**
 * 消息配置服务
 * 用于读取和保存 MessageModule 的配置
 */
@Injectable()
export class MessageConfigService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * 保存配置
   */
  set(config: MessageConfig) {
    this.configService.set(MESSAGE_CONFIG, config);
  }

  /**
   * 获取当前配置
   */
  get<T = MessageConfig>(): T | undefined {
    return this.configService.get<T>(MESSAGE_CONFIG);
  }
}
