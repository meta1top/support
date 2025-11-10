import { Injectable, Logger } from "@nestjs/common";
import { InjectRedis } from "@nestjs-modules/ioredis";
import type { Redis } from "ioredis";

import { AppError, ErrorCode, WithLock } from "@meta-1/nest-common";

export interface Order {
  orderId: string;
  userId: string;
  productId: string;
  quantity: number;
  status: "pending" | "paid" | "cancelled";
  createdAt: Date;
  paidAt?: Date;
}

@Injectable()
export class TestLockService {
  private readonly logger = new Logger(TestLockService.name);

  // 模拟数据库（内存存储）
  private orders: Map<string, Order> = new Map();
  private inventory: Map<string, number> = new Map();
  private orderCounter = 0;

  constructor(@InjectRedis() private readonly redis: Redis) {}

  /**
   * 测试 1: 基础分布式锁 - 防止重复创建订单
   *
   * 使用场景：防止用户快速点击多次导致重复下单
   */
  @WithLock({
    key: "lock:order:create:#{userId}",
    ttl: 10000, // 10 秒
    waitTimeout: 2000, // 等待 3 秒
    errorMessage: "订单创建中，请稍后重试",
  })
  async createOrder(userId: string, productId: string, quantity: number): Promise<Order> {
    this.logger.log(`开始创建订单 - 用户: ${userId}, 商品: ${productId}, 数量: ${quantity}`);

    // 模拟业务处理耗时
    await this.sleep(5000);

    // 生成订单
    const orderId = `order_${++this.orderCounter}_${Date.now()}`;
    const order: Order = {
      orderId,
      userId,
      productId,
      quantity,
      status: "pending",
      createdAt: new Date(),
    };

    this.orders.set(orderId, order);

    this.logger.log(`订单创建成功 - 订单ID: ${orderId}`);

    return order;
  }

  /**
   * 测试 2: 零等待时间 - 防止重复支付
   *
   * 使用场景：防止用户重复提交支付请求
   * 特点：waitTimeout 设为 0，不等待，立即失败
   */
  @WithLock({
    key: "lock:payment:#{orderId}",
    ttl: 30000, // 30 秒（支付可能耗时较长）
    waitTimeout: 0, // 不等待，立即失败
    errorMessage: "订单正在支付中，请勿重复提交",
  })
  async processPayment(orderId: string): Promise<{ orderId: string; transactionId: string }> {
    this.logger.log(`开始处理支付 - 订单ID: ${orderId}`);

    // 检查订单是否存在
    const order = this.orders.get(orderId);
    if (!order) {
      throw new AppError(ErrorCode.NOT_FOUND, { resource: "order", orderId });
    }

    // 检查订单状态
    if (order.status !== "pending") {
      throw new AppError(ErrorCode.VALIDATION_FAILED, {
        message: `订单状态不正确: ${order.status}`,
      });
    }

    // 模拟支付网关调用（耗时 3 秒）
    this.logger.log(`调用支付网关 - 订单ID: ${orderId}`);
    await this.sleep(3000);

    // 更新订单状态
    order.status = "paid";
    order.paidAt = new Date();
    this.orders.set(orderId, order);

    const transactionId = `txn_${Date.now()}`;

    this.logger.log(`支付成功 - 订单ID: ${orderId}, 交易ID: ${transactionId}`);

    return {
      orderId,
      transactionId,
    };
  }

  /**
   * 测试 3: 库存扣减
   *
   * 使用场景：防止超卖
   * 特点：锁粒度为商品级别，不同商品可以并发操作
   */
  @WithLock({
    key: "lock:inventory:#{productId}",
    ttl: 5000, // 5 秒
    waitTimeout: 2000, // 等待 2 秒
  })
  async reduceInventory(productId: string, quantity: number): Promise<number> {
    this.logger.log(`开始扣减库存 - 商品: ${productId}, 数量: ${quantity}`);

    // 获取当前库存
    const currentInventory = this.inventory.get(productId) || 0;

    // 检查库存
    if (currentInventory < quantity) {
      throw new AppError(ErrorCode.VALIDATION_FAILED, {
        message: "库存不足",
        available: currentInventory,
        requested: quantity,
      });
    }

    // 模拟数据库操作耗时
    await this.sleep(100);

    // 扣减库存
    const newInventory = currentInventory - quantity;
    this.inventory.set(productId, newInventory);

    this.logger.log(`库存扣减成功 - 商品: ${productId}, 剩余库存: ${newInventory}`);

    return newInventory;
  }

  /**
   * 初始化库存（无锁）
   */
  async initInventory(productId: string, quantity: number): Promise<void> {
    this.inventory.set(productId, quantity);
    this.logger.log(`库存初始化 - 商品: ${productId}, 数量: ${quantity}`);
  }

  /**
   * 查询库存（无锁）
   */
  async getInventory(productId: string): Promise<number> {
    return this.inventory.get(productId) || 0;
  }

  /**
   * 并发测试助手
   */
  async runConcurrentTest(type: "order" | "payment" | "inventory"): Promise<{
    type: string;
    total: number;
    success: number;
    failed: number;
    duration: number;
    results: Array<{ success: boolean; message?: string; duration: number }>;
  }> {
    const startTime = Date.now();
    const concurrentCount = 10;
    const promises: Promise<{ success: boolean; message?: string; duration: number }>[] = [];

    this.logger.log(`开始并发测试 - 类型: ${type}, 并发数: ${concurrentCount}`);

    // 准备测试数据
    if (type === "payment") {
      // 先创建一个订单用于支付测试
      const order = await this.createOrder("testUser", "testProduct", 1);
      const orderId = order.orderId;

      for (let i = 0; i < concurrentCount; i++) {
        promises.push(
          (async () => {
            const reqStartTime = Date.now();
            try {
              await this.processPayment(orderId);
              return {
                success: true,
                duration: Date.now() - reqStartTime,
              };
            } catch (error) {
              return {
                success: false,
                message: error.message,
                duration: Date.now() - reqStartTime,
              };
            }
          })(),
        );
      }
    } else if (type === "inventory") {
      const productId = `product_${Date.now()}`;
      await this.initInventory(productId, concurrentCount); // 初始化库存

      for (let i = 0; i < concurrentCount; i++) {
        promises.push(
          (async () => {
            const reqStartTime = Date.now();
            try {
              await this.reduceInventory(productId, 1);
              return {
                success: true,
                duration: Date.now() - reqStartTime,
              };
            } catch (error) {
              return {
                success: false,
                message: error.message,
                duration: Date.now() - reqStartTime,
              };
            }
          })(),
        );
      }
    } else {
      // order 测试
      const userId = `user_${Date.now()}`;

      for (let i = 0; i < concurrentCount; i++) {
        promises.push(
          (async () => {
            const reqStartTime = Date.now();
            try {
              await this.createOrder(userId, `product_${i}`, 1);
              return {
                success: true,
                duration: Date.now() - reqStartTime,
              };
            } catch (error) {
              return {
                success: false,
                message: error.message,
                duration: Date.now() - reqStartTime,
              };
            }
          })(),
        );
      }
    }

    // 等待所有请求完成
    const results = await Promise.all(promises);

    const duration = Date.now() - startTime;
    const success = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    this.logger.log(`并发测试完成 - 类型: ${type}, 成功: ${success}, 失败: ${failed}, 耗时: ${duration}ms`);

    return {
      type,
      total: concurrentCount,
      success,
      failed,
      duration,
      results,
    };
  }

  /**
   * 清理测试数据
   */
  async cleanup(): Promise<void> {
    this.orders.clear();
    this.inventory.clear();
    this.orderCounter = 0;

    // 清理 Redis 中的锁（仅用于测试）
    const keys = await this.redis.keys("lock:*");
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }

    this.logger.log("测试数据已清理");
  }

  /**
   * 工具方法：睡眠
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
