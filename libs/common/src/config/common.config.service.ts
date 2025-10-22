import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { COMMON_CONFIG, type CommonConfig } from "../shared";

/**
 * 消息配置服务
 * 用于读取和保存 MessageModule 的配置
 */
@Injectable()
export class CommonConfigService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * 保存配置
   */
  set(config: CommonConfig) {
    this.configService.set(COMMON_CONFIG, config);
  }

  /**
   * 获取当前配置
   */
  get<T = CommonConfig>(): T | undefined {
    return this.configService.get<T>(COMMON_CONFIG);
  }
}
