import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { AppError, ErrorCode } from "@meta-1/nest-common";
import { SECURITY_CONFIG, type SecurityConfig } from "../shared";

/**
 * 消息配置服务
 * 用于读取和保存 MessageModule 的配置
 */
@Injectable()
export class SecurityConfigService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * 保存配置
   */
  set(config: SecurityConfig) {
    this.configService.set(SECURITY_CONFIG, config);
  }

  /**
   * 获取当前配置
   */
  get<T = SecurityConfig>(): T {
    const config = this.configService.get<T>(SECURITY_CONFIG);
    if (!config) {
      throw new AppError(ErrorCode.CONFIG_NOT_FOUND);
    }
    return config;
  }
}
