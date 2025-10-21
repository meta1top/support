import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { DiscoveryService } from "@nestjs/core";
import { InjectRedis } from "@nestjs-modules/ioredis";
import type { Redis } from "ioredis";

import { hasCacheableMetadata, injectRedisToInstance } from "./cacheable.decorator";

/**
 * 缓存初始化器
 * 自动发现所有使用 @CacheableService() 的类并注入 Redis
 */
@Injectable()
export class CacheableInitializer implements OnModuleInit {
  private readonly logger = new Logger(CacheableInitializer.name);

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly discoveryService: DiscoveryService,
  ) {}

  onModuleInit() {
    const providers = this.discoveryService.getProviders();
    let injectedCount = 0;

    providers.forEach((wrapper) => {
      const { instance } = wrapper;

      // 检查是否是有缓存元数据的 Service
      if (instance && hasCacheableMetadata(instance)) {
        injectRedisToInstance(instance, this.redis);
        injectedCount++;
        this.logger.debug(`Injected Redis to ${instance.constructor.name}`);
      }
    });

    if (injectedCount > 0) {
      this.logger.log(`Initialized cacheable services: ${injectedCount} services`);
    }
  }
}
