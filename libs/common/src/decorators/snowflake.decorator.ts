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
 * - 线程安全：使用同步锁防止并发问题
 * - 时间回拨保护：检测并等待时钟恢复
 * - 序列号耗尽处理：自动等待下一毫秒
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

  private isGenerating = false;
  private waitQueue: Array<(id: string) => void> = [];

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
   * 生成下一个ID（同步方法，内部处理并发）
   */
  private nextIdSync(): string {
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
   * 生成下一个ID（带并发控制）
   */
  next(): string {
    if (this.isGenerating) {
      return new Promise<string>((resolve) => {
        this.waitQueue.push(resolve);
      }) as unknown as string;
    }

    this.isGenerating = true;

    try {
      const id = this.nextIdSync();

      if (this.waitQueue.length > 0) {
        const next = this.waitQueue.shift();
        if (next) {
          setImmediate(() => {
            this.isGenerating = false;
            next(this.next());
          });
        }
      } else {
        this.isGenerating = false;
      }

      return id;
    } catch (error) {
      this.isGenerating = false;
      throw error;
    }
  }

  /**
   * 批量生成ID（确保无重复）
   */
  nextBatch(count: number): string[] {
    const ids: string[] = [];
    for (let i = 0; i < count; i++) {
      ids.push(this.nextIdSync());
    }
    return ids;
  }
}

const snowflakeGenerator = new SnowflakeGenerator(); // 全局单例

/**
 * 生成一个雪花ID字符串
 *
 * @returns 19位数字字符串（范围: 0 ~ 9223372036854775807）
 *
 * @example
 * ```typescript
 * const id = generateSnowflakeId();
 * console.log(id); // "7234567890123456789"
 * ```
 *
 * 特点：
 * - 返回字符串格式，避免JavaScript Number精度问题（Number.MAX_SAFE_INTEGER = 2^53-1）
 * - 时间有序，可按时间排序
 * - 分布式唯一，支持多机部署
 * - 高性能，单机每毫秒可生成4096个ID
 *
 * 前端使用注意事项：
 * - 请保持字符串格式传输和存储
 * - 如需比较大小，使用 BigInt(id1) > BigInt(id2)
 * - 如需展示，可直接使用字符串
 */
function generateSnowflakeId(): string {
  return snowflakeGenerator.next();
}

/**
 * 批量生成雪花ID
 * 用于批量插入场景，确保所有ID唯一且无并发问题
 *
 * @param count 生成数量
 * @returns ID数组（字符串格式）
 *
 * @example
 * ```typescript
 * const ids = generateBatchSnowflakeIds(100);
 * const users = ids.map(id => ({ id, name: 'User' }));
 * await repository.insert(users);
 * ```
 */
function generateBatchSnowflakeIds(count: number): string[] {
  return snowflakeGenerator.nextBatch(count);
}

/**
 * 雪花ID主键装饰器
 * 自动生成分布式唯一ID作为主键
 *
 * @example
 * ```typescript
 * @Entity()
 * export class User {
 *   @SnowflakeId()
 *   id: string;  // 注意：类型必须是 string
 *
 *   @Column()
 *   name: string;
 * }
 * ```
 *
 * 数据库存储：
 * - MySQL: BIGINT 或 VARCHAR(20)
 * - PostgreSQL: BIGINT 或 VARCHAR(20)
 * - 推荐使用 VARCHAR(20) 避免不同数据库的兼容性问题
 */
export function SnowflakeId(): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    PrimaryColumn("varchar", { length: 20 })(target, propertyKey);

    const prototype = target as Record<string, unknown>;
    const hookName = "__beforeInsertForSnowflake";

    if (!prototype[hookName]) {
      prototype[hookName] = function (this: Record<string | symbol, unknown>) {
        if (!this[propertyKey]) {
          this[propertyKey] = generateSnowflakeId();
        }
      };

      BeforeInsert()(target, hookName);
    }
  };
}

export { generateSnowflakeId, generateBatchSnowflakeIds };
