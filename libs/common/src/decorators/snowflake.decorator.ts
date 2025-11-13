import { BeforeInsert, PrimaryColumn } from "typeorm";

/**
 * 雪花ID生成器类
 *
 * 雪花ID结构（64位）：
 * - 1位符号位（固定为0）
 * - 41位时间戳（毫秒级，可用约69年）
 * - 10位机器ID（5位数据中心ID + 5位工作机器ID）
 * - 12位序列号（同一毫秒内最多4096个ID）
 *
 * 关键特性：
 * - 并发安全：通过Promise队列实现真正的并发控制
 * - 时间回拨保护：检测并拒绝时钟回拨
 * - 序列号耗尽处理：自动等待下一毫秒
 *
 * 设计理念：
 * - 用户只需使用 @SnowflakeId() 装饰器即可
 * - 内部自动处理所有并发安全问题
 * - 无需关心ID生成细节
 */
class SnowflakeGenerator {
  private readonly epoch = 1609459200000n; // 2021-01-01 00:00:00 UTC (自定义起始时间)
  private readonly workerIdBits = 5n;
  private readonly datacenterIdBits = 5n;
  private readonly sequenceBits = 12n;

  private readonly maxWorkerId = -1n ^ (-1n << this.workerIdBits); // 31
  private readonly maxDatacenterId = -1n ^ (-1n << this.datacenterIdBits); // 31
  private readonly maxSequence = -1n ^ (-1n << this.sequenceBits); // 4095

  private readonly workerIdShift = this.sequenceBits; // 12
  private readonly datacenterIdShift = this.sequenceBits + this.workerIdBits; // 17
  private readonly timestampShift = this.sequenceBits + this.workerIdBits + this.datacenterIdBits; // 22

  private readonly workerId: bigint;
  private readonly datacenterId: bigint;

  private lastTimestamp = -1n;
  private sequence = 0n;

  // 并发控制：使用Promise链确保串行执行
  private generationChain: Promise<void> = Promise.resolve();

  constructor() {
    const workerIdEnv = Number(process.env.SNOWFLAKE_WORKER_ID) || 0;
    const datacenterIdEnv = Number(process.env.SNOWFLAKE_DATACENTER_ID) || 0;

    this.workerId = BigInt(workerIdEnv);
    this.datacenterId = BigInt(datacenterIdEnv);

    if (this.workerId > this.maxWorkerId || this.workerId < 0n) {
      throw new Error(`Worker ID 必须在 0 到 ${this.maxWorkerId} 之间`);
    }
    if (this.datacenterId > this.maxDatacenterId || this.datacenterId < 0n) {
      throw new Error(`Datacenter ID 必须在 0 到 ${this.maxDatacenterId} 之间`);
    }
  }

  /**
   * 获取当前时间戳（毫秒）
   */
  private getCurrentTimestamp(): bigint {
    return BigInt(Date.now());
  }

  /**
   * 等待下一毫秒
   */
  private waitNextMillis(lastTimestamp: bigint): bigint {
    let timestamp = this.getCurrentTimestamp();
    while (timestamp <= lastTimestamp) {
      timestamp = this.getCurrentTimestamp();
    }
    return timestamp;
  }

  /**
   * 核心ID生成逻辑（内部方法，不做并发控制）
   * 注意：此方法不是线程安全的，必须通过 next() 或 nextAsync() 调用
   */
  private generateIdUnsafe(): string {
    let timestamp = this.getCurrentTimestamp();

    if (timestamp < this.lastTimestamp) {
      const offset = this.lastTimestamp - timestamp;
      throw new Error(`时钟回拨了 ${offset}ms，拒绝生成ID。请检查系统时间。`);
    }

    if (timestamp === this.lastTimestamp) {
      this.sequence = (this.sequence + 1n) & this.maxSequence;
      if (this.sequence === 0n) {
        timestamp = this.waitNextMillis(this.lastTimestamp);
      }
    } else {
      this.sequence = 0n;
    }

    this.lastTimestamp = timestamp;

    const id =
      ((timestamp - this.epoch) << this.timestampShift) |
      (this.datacenterId << this.datacenterIdShift) |
      (this.workerId << this.workerIdShift) |
      this.sequence;

    return id.toString();
  }

  /**
   * 生成下一个ID（并发安全的异步版本）
   * 通过Promise链确保所有调用串行执行，避免状态竞争
   *
   * 设计说明：
   * - TypeORM 的钩子支持异步函数，且会等待 Promise 完成
   * - 通过 Promise 链强制串行，即使批量保存也能保证 ID 唯一
   * - 无论是单条插入还是批量插入，都使用统一的并发安全机制
   */
  async next(): Promise<string> {
    // 将当前生成任务加入Promise链，确保串行执行
    const result = this.generationChain.then(() => this.generateIdUnsafe());

    // 更新链，无论成功或失败都继续
    this.generationChain = result.then(
      () => {},
      () => {},
    );

    return result;
  }

  /**
   * 批量生成ID（并发安全的异步版本）
   * 通过Promise链确保批量生成的原子性
   *
   * @param count 生成数量
   * @returns ID数组（字符串格式）
   */
  async nextBatch(count: number): Promise<string[]> {
    if (count <= 0) {
      return [];
    }

    // 通过Promise链确保批量生成的原子性
    const result = this.generationChain.then(() => {
      const ids: string[] = [];
      for (let i = 0; i < count; i++) {
        ids.push(this.generateIdUnsafe());
      }
      return ids;
    });

    // 更新链
    this.generationChain = result.then(
      () => {},
      () => {},
    );

    return result;
  }
}

const snowflakeGenerator = new SnowflakeGenerator(); // 全局单例

/**
 * 雪花ID主键装饰器
 *
 * 使用说明：
 * 只需在实体类的主键字段上添加此装饰器，即可自动生成分布式唯一ID
 *
 * 核心特性：
 * - ✅ 并发安全：内部使用 Promise 链确保多实例同时插入时 ID 不重复
 * - ✅ 分布式唯一：支持多机部署（通过环境变量配置 workerId 和 datacenterId）
 * - ✅ 时间有序：ID 按生成时间递增，有利于数据库索引和范围查询
 * - ✅ 高性能：单机每毫秒可生成 4096 个唯一 ID
 * - ✅ 自动处理：无需手动调用任何 ID 生成方法
 *
 * @example
 * 基础用法：
 * ```typescript
 * import { Entity, Column } from 'typeorm';
 * import { SnowflakeId } from '@support/common';
 *
 * @Entity()
 * export class User {
 *   @SnowflakeId()
 *   id: string;  // 类型必须是 string
 *
 *   @Column()
 *   name: string;
 * }
 *
 * // 使用时无需手动设置 ID
 * const user = new User();
 * user.name = 'Alice';
 * await repository.save(user);  // ID 自动生成
 * console.log(user.id);  // "7234567890123456789"
 * ```
 *
 * @example
 * 批量插入（完全并发安全）：
 * ```typescript
 * const users = [
 *   { name: 'Alice' },
 *   { name: 'Bob' },
 *   { name: 'Charlie' }
 * ].map(data => {
 *   const user = new User();
 *   user.name = data.name;
 *   return user;
 * });
 *
 * // 批量保存，ID 自动生成且保证唯一
 * await repository.save(users);
 * ```
 *
 * @example
 * 多机部署配置：
 * ```bash
 * # 服务器 1
 * SNOWFLAKE_WORKER_ID=0
 * SNOWFLAKE_DATACENTER_ID=0
 *
 * # 服务器 2
 * SNOWFLAKE_WORKER_ID=1
 * SNOWFLAKE_DATACENTER_ID=0
 *
 * # 最多支持 1024 个节点（32 数据中心 × 32 工作机器）
 * ```
 *
 * 数据库字段类型：
 * - MySQL: VARCHAR(20) 或 BIGINT
 * - PostgreSQL: VARCHAR(20) 或 BIGINT
 * - 推荐使用 VARCHAR(20) 避免数值溢出和兼容性问题
 *
 * 前端使用注意：
 * - ID 以字符串格式传输和存储
 * - 比较大小使用：BigInt(id1) > BigInt(id2)
 * - JavaScript Number 最大安全整数为 2^53-1，雪花ID 可达 2^63-1，必须用字符串
 */
export function SnowflakeId(): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    // 配置主键列
    PrimaryColumn("varchar", { length: 20 })(target, propertyKey);

    const prototype = target as Record<string, unknown>;
    const hookName = "__beforeInsertForSnowflake";

    if (!prototype[hookName]) {
      // 使用异步钩子确保并发安全
      prototype[hookName] = async function (this: Record<string | symbol, unknown>) {
        if (!this[propertyKey]) {
          // 通过Promise链确保即使批量插入也不会产生重复ID
          this[propertyKey] = await snowflakeGenerator.next();
        }
      };

      // 注册TypeORM的BeforeInsert钩子
      BeforeInsert()(target, hookName);
    }
  };
}
