import { Logger } from "@nestjs/common";
import type { Redis } from "ioredis";

const REDIS_INSTANCE_KEY = Symbol("REDIS_INSTANCE");
const CACHEABLE_METHODS_KEY = Symbol("CACHEABLE_METHODS");

/**
 * 类装饰器：标记 Service 需要缓存功能
 * 会在实例化时注入 Redis 实例
 */
export function CacheableService(): ClassDecorator {
  // biome-ignore lint/suspicious/noExplicitAny: class decorator
  return (target: any) => {
    // 标记这个类需要缓存功能
    Reflect.defineMetadata(CACHEABLE_METHODS_KEY, true, target);
  };
}

/**
 * 缓存装饰器
 * 类似 Spring Boot @Cacheable
 */
export function Cacheable(options: { key: string; ttl?: number }): MethodDecorator {
  // biome-ignore lint/suspicious/noExplicitAny: decorator target type
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    const className = target.constructor.name;

    // biome-ignore lint/suspicious/noExplicitAny: method arguments
    descriptor.value = async function (...args: any[]) {
      const redis: Redis = Reflect.getMetadata(REDIS_INSTANCE_KEY, this);
      const logger = new Logger(`${className}:${String(propertyKey)}`);

      if (!redis) {
        logger.warn("Redis not injected, executing without cache");
        return originalMethod.apply(this, args);
      }

      const cacheKey = generateCacheKey(options.key, args);
      const ttl = options.ttl || 60;

      logger.debug(`Cache key: ${cacheKey}`);

      try {
        // 检查缓存
        const cachedValue = await redis.get(cacheKey);
        if (cachedValue) {
          logger.debug(`Cache hit: ${cacheKey}`);
          return JSON.parse(cachedValue);
        }

        logger.debug(`Cache miss: ${cacheKey}`);

        // 执行原方法
        const result = await originalMethod.apply(this, args);

        // 缓存结果
        await redis.setex(cacheKey, ttl, JSON.stringify(result));
        logger.debug(`Cached result: ${cacheKey}, TTL: ${ttl}s`);

        return result;
      } catch (error) {
        logger.error(`Cache error: ${error}, fallback to original method`);
        return originalMethod.apply(this, args);
      }
    };

    return descriptor;
  };
}

/**
 * 清除缓存装饰器
 * 类似 Spring Boot @CacheEvict
 */
export function CacheEvict(options: { key?: string; allEntries?: boolean }): MethodDecorator {
  // biome-ignore lint/suspicious/noExplicitAny: decorator target type
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    const className = target.constructor.name;

    // biome-ignore lint/suspicious/noExplicitAny: method arguments
    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);
      const redis: Redis = Reflect.getMetadata(REDIS_INSTANCE_KEY, this);
      const logger = new Logger(`${className}:${String(propertyKey)}`);

      if (!redis) {
        logger.warn("Redis not injected, skipping cache eviction");
        return result;
      }

      try {
        if (options.allEntries) {
          await redis.flushdb();
          logger.debug("Cleared all cache");
        } else if (options.key) {
          const cacheKey = generateCacheKey(options.key, args);
          await redis.del(cacheKey);
          logger.debug(`Evicted cache: ${cacheKey}`);
        }
      } catch (error) {
        logger.error(`Cache eviction error: ${error}`);
      }

      return result;
    };

    return descriptor;
  };
}

/**
 * 工具函数：为实例注入 Redis
 * 由拦截器或初始化器调用
 */
// biome-ignore lint/suspicious/noExplicitAny: service instance
export function injectRedisToInstance(instance: any, redis: Redis) {
  Reflect.defineMetadata(REDIS_INSTANCE_KEY, redis, instance);
}

/**
 * 工具函数：检查类是否需要缓存功能
 */
// biome-ignore lint/suspicious/noExplicitAny: service instance
export function hasCacheableMetadata(target: any): boolean {
  return Reflect.getMetadata(CACHEABLE_METHODS_KEY, target.constructor) === true;
}

/**
 * 生成缓存键
 * 支持占位符：#{0}, #{1} 等表示参数位置
 */
// biome-ignore lint/suspicious/noExplicitAny: generic cache key generation
function generateCacheKey(pattern: string, args: any[]): string {
  let cacheKey = pattern;

  // 替换参数占位符 #{0}, #{1}, #{2} ...
  args.forEach((arg, index) => {
    cacheKey = cacheKey.replace(new RegExp(`#\\{${index}\\}`, "g"), String(arg));
  });

  // 如果参数是对象，尝试替换属性占位符 #{id}, #{name} 等
  if (args.length > 0 && typeof args[0] === "object") {
    const firstArg = args[0];
    Object.keys(firstArg).forEach((key) => {
      cacheKey = cacheKey.replace(new RegExp(`#\\{${key}\\}`, "g"), String(firstArg[key]));
    });
  }

  return cacheKey;
}
