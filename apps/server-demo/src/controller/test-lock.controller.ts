import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiProperty, ApiResponse } from "@nestjs/swagger";

import { TestLockService } from "../service";

class CreateOrderDto {
  @ApiProperty({
    description: "用户ID",
    example: "user123",
  })
  userId: string;

  @ApiProperty({
    description: "商品ID",
    example: "product456",
  })
  productId: string;

  @ApiProperty({
    description: "购买数量",
    example: 2,
    minimum: 1,
  })
  quantity: number;
}

class ProcessPaymentDto {
  @ApiProperty({
    description: "订单ID",
    example: "order_1_1234567890",
  })
  orderId: string;
}

class InitInventoryDto {
  @ApiProperty({
    description: "商品ID",
    example: "product789",
  })
  productId: string;

  @ApiProperty({
    description: "库存数量",
    example: 100,
    minimum: 0,
  })
  quantity: number;
}

class ReduceInventoryDto {
  @ApiProperty({
    description: "扣减数量",
    example: 1,
    minimum: 1,
  })
  quantity: number;
}

@Controller("/test/lock")
export class TestLockController {
  constructor(private readonly testLockService: TestLockService) {}

  /**
   * 测试 1: 基础分布式锁 - 防止重复创建订单
   *
   * 测试方法：
   * 1. 同时发送多个请求到 POST /test-lock/order
   * 2. 使用相同的 userId
   * 3. 观察只有一个请求成功，其他请求会等待或失败
   */
  @Post("order")
  @ApiOperation({
    summary: "创建订单（测试分布式锁）",
    description: "测试基础分布式锁功能，防止用户重复创建订单。同时发送多个请求，观察只有一个成功。",
  })
  @ApiBody({
    type: CreateOrderDto,
    examples: {
      example1: {
        summary: "示例订单",
        value: {
          userId: "user123",
          productId: "product456",
          quantity: 2,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "订单创建成功",
    schema: {
      example: {
        success: true,
        message: "订单创建成功",
        data: {
          orderId: "order_1_1234567890",
          userId: "user123",
          productId: "product456",
          quantity: 2,
          status: "pending",
          createdAt: "2024-01-01T00:00:00.000Z",
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: "获取锁失败",
    schema: {
      example: {
        success: false,
        message: "订单创建中，请稍后重试",
      },
    },
  })
  async createOrder(@Body() dto: CreateOrderDto) {
    return await this.testLockService.createOrder(dto.userId, dto.productId, dto.quantity);
  }

  /**
   * 测试 2: 零等待时间 - 防止重复支付
   *
   * 测试方法：
   * 1. 先创建一个订单（POST /test-lock/order）
   * 2. 同时发送多个支付请求（POST /test-lock/payment）
   * 3. 观察只有第一个请求成功，其他立即失败（不等待）
   */
  @Post("payment")
  @ApiOperation({
    summary: "处理支付（测试零等待锁）",
    description: "测试零等待时间的分布式锁，防止重复支付。waitTimeout 设为 0，立即失败不等待。",
  })
  @ApiBody({
    type: ProcessPaymentDto,
    examples: {
      example1: {
        summary: "支付订单",
        value: {
          orderId: "order_1_1234567890",
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "支付成功",
    schema: {
      example: {
        success: true,
        message: "支付成功",
        data: {
          orderId: "order_1_1234567890",
          transactionId: "txn_1234567890",
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: "订单正在支付中",
    schema: {
      example: {
        success: false,
        message: "订单正在支付中，请勿重复提交",
      },
    },
  })
  async processPayment(@Body() dto: ProcessPaymentDto) {
    return await this.testLockService.processPayment(dto.orderId);
  }

  /**
   * 测试 3: 库存扣减
   *
   * 测试方法：
   * 1. 先设置库存（POST /test-lock/inventory/init）
   * 2. 同时发送多个扣减请求（POST /test-lock/inventory/reduce/:productId）
   * 3. 观察库存正确扣减，不会出现负数
   */
  @Post("inventory/init")
  @ApiOperation({
    summary: "初始化库存",
    description: "初始化商品库存，用于测试库存扣减功能。",
  })
  @ApiBody({
    type: InitInventoryDto,
    examples: {
      example1: {
        summary: "初始化 100 件库存",
        value: {
          productId: "product789",
          quantity: 100,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "库存初始化成功",
  })
  async initInventory(@Body() body: InitInventoryDto) {
    await this.testLockService.initInventory(body.productId, body.quantity);
    return { message: "库存初始化成功", productId: body.productId, quantity: body.quantity };
  }

  @Post("inventory/reduce/:productId")
  @ApiOperation({
    summary: "扣减库存（测试防超卖）",
    description: "测试分布式锁防止库存超卖。同时发送多个请求，观察库存正确扣减。",
  })
  @ApiParam({
    name: "productId",
    description: "商品ID",
    example: "product789",
  })
  @ApiBody({
    type: ReduceInventoryDto,
    examples: {
      example1: {
        summary: "扣减 1 件",
        value: {
          quantity: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "库存扣减成功",
    schema: {
      example: {
        success: true,
        message: "库存扣减成功",
        data: {
          productId: "product789",
          newInventory: 99,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "库存不足",
  })
  async reduceInventory(@Param("productId") productId: string, @Body() body: ReduceInventoryDto) {
    const newInventory = await this.testLockService.reduceInventory(productId, body.quantity);
    return { productId, newInventory };
  }

  @Get("inventory/:productId")
  @ApiOperation({
    summary: "查询库存",
    description: "查询商品当前库存数量。",
  })
  @ApiParam({
    name: "productId",
    description: "商品ID",
    example: "product789",
  })
  @ApiResponse({
    status: 200,
    description: "查询成功",
    schema: {
      example: {
        success: true,
        data: {
          productId: "product789",
          inventory: 100,
        },
      },
    },
  })
  async getInventory(@Param("productId") productId: string) {
    const inventory = await this.testLockService.getInventory(productId);
    return { productId, inventory };
  }

  /**
   * 测试 4: 并发测试助手 - 模拟高并发
   *
   * 测试方法：
   * 1. 发送请求到 GET /test-lock/concurrent-test/:type
   * 2. type 可以是: order, payment, inventory
   * 3. 服务端会自动发起 10 个并发请求
   * 4. 观察结果统计
   */
  @Get("concurrent-test/:type")
  @ApiOperation({
    summary: "并发测试",
    description: "服务端自动发起 10 个并发请求，测试分布式锁的并发控制效果。",
  })
  @ApiParam({
    name: "type",
    description: "测试类型",
    enum: ["order", "payment", "inventory"],
    example: "order",
  })
  @ApiResponse({
    status: 200,
    description: "测试完成",
    schema: {
      example: {
        success: true,
        message: "并发测试完成",
        data: {
          type: "order",
          total: 10,
          success: 1,
          failed: 9,
          duration: 2345,
          results: [
            { success: true, duration: 2123 },
            { success: false, message: "订单创建中，请稍后重试", duration: 234 },
          ],
        },
      },
    },
  })
  async concurrentTest(@Param("type") type: "order" | "payment" | "inventory") {
    return await this.testLockService.runConcurrentTest(type);
  }

  /**
   * 测试 5: 清理测试数据
   */
  @Post("cleanup")
  @ApiOperation({
    summary: "清理测试数据",
    description: "清理所有测试订单、库存数据和 Redis 锁。",
  })
  @ApiResponse({
    status: 200,
    description: "清理成功",
  })
  async cleanup() {
    await this.testLockService.cleanup();
    return { message: "测试数据已清理" };
  }

  /**
   * 获取测试说明
   */
  @Get("help")
  @ApiOperation({
    summary: "获取测试说明",
    description: "获取所有测试接口的使用说明和测试方法。",
  })
  @ApiResponse({
    status: 200,
    description: "测试说明",
  })
  getHelp() {
    return {
      title: "分布式锁测试 API",
      description: "使用以下接口测试 @WithLock 装饰器的功能",
      tests: [
        {
          name: "测试 1: 防止重复创建订单",
          endpoint: "POST /test-lock/order",
          body: {
            userId: "user123",
            productId: "product456",
            quantity: 2,
          },
          howToTest: "同时发送多个请求，观察只有一个成功",
        },
        {
          name: "测试 2: 防止重复支付",
          endpoint: "POST /test-lock/payment",
          body: {
            orderId: "order_xxx",
          },
          howToTest: "先创建订单，然后同时发送多个支付请求，观察只有第一个成功，其他立即失败",
        },
        {
          name: "测试 3: 库存扣减",
          steps: [
            {
              step: 1,
              endpoint: "POST /test-lock/inventory/init",
              body: { productId: "product789", quantity: 100 },
            },
            {
              step: 2,
              endpoint: "POST /test-lock/inventory/reduce/product789",
              body: { quantity: 1 },
              howToTest: "同时发送 100 个请求，观察库存正确扣减到 0",
            },
            {
              step: 3,
              endpoint: "GET /test-lock/inventory/product789",
              description: "查看最终库存",
            },
          ],
        },
        {
          name: "测试 4: 自动并发测试",
          endpoint: "GET /test-lock/concurrent-test/:type",
          params: {
            type: "order | payment | inventory",
          },
          howToTest: "服务端自动发起 10 个并发请求，返回统计结果",
        },
        {
          name: "测试 5: 清理测试数据",
          endpoint: "POST /test-lock/cleanup",
          description: "清理所有测试数据和 Redis 锁",
        },
      ],
      notes: [
        "所有测试数据都存储在内存中，重启服务会丢失",
        "可以使用 Postman、curl 或其他工具进行测试",
        "建议使用 Postman 的 Collection Runner 进行并发测试",
      ],
    };
  }
}
