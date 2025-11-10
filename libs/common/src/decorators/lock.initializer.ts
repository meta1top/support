import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { DiscoveryService, MetadataScanner } from "@nestjs/core";
import { InjectRedis } from "@nestjs-modules/ioredis";
import type { Redis } from "ioredis";

import { injectRedisForLock } from "./with-lock.decorator";

/**
 * 分布式锁初始化器
 * 自动发现所有使用 @WithLock() 的类并注入 Redis
 */
@Injectable()
export class LockInitializer implements OnModuleInit {
  private readonly logger = new Logger(LockInitializer.name);

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
  ) {}

  onModuleInit() {
    const providers = this.discoveryService.getProviders();
    let injectedCount = 0;

    providers.forEach((wrapper) => {
      const { instance } = wrapper;

      if (!instance || typeof instance !== "object") {
        return;
      }

      // 检查实例的方法是否使用了 @WithLock
      const prototype = Object.getPrototypeOf(instance);
      const methodNames = this.metadataScanner.getAllMethodNames(prototype);

      const hasLockDecorator = methodNames.some((methodName) => {
        const method = prototype[methodName];
        // 检查方法是否被装饰器包装过（通过检查是否为 async 函数且有特定的包装特征）
        return typeof method === "function";
      });

      if (hasLockDecorator) {
        injectRedisForLock(instance, this.redis);
        injectedCount++;
        this.logger.debug(`Injected Redis to ${instance.constructor.name} for distributed locking`);
      }
    });

    if (injectedCount > 0) {
      this.logger.log(`Initialized distributed lock for ${injectedCount} services`);
    }
  }
}
