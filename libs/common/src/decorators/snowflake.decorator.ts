import FlakeId from "flake-idgen";
import { BeforeInsert, PrimaryColumn } from "typeorm";

/**
 * 雪花ID生成器类
 * 支持高并发和批量生成，确保ID唯一性
 */
class SnowflakeGenerator {
  private flakeIdGen: FlakeId;
  private lastTimestamp: number = 0;
  private sequence: number = 0;
  private readonly maxSequence: number = 4095; // 12位序列号最大值

  constructor() {
    this.flakeIdGen = new FlakeId({
      // 可以通过环境变量配置机器ID和数据中心ID
      datacenter: Number(process.env.SNOWFLAKE_DATACENTER_ID) || 0,
      worker: Number(process.env.SNOWFLAKE_WORKER_ID) || 0,
    });
  }

  /**
   * 生成下一个ID
   * 添加序列号管理，防止同一毫秒内生成重复ID
   */
  next(): Buffer {
    const currentTimestamp = Date.now();

    // 如果在同一毫秒内，增加序列号
    if (currentTimestamp === this.lastTimestamp) {
      this.sequence = (this.sequence + 1) & this.maxSequence;

      // 如果序列号用尽，等待下一毫秒
      if (this.sequence === 0) {
        let timestamp = Date.now();
        while (timestamp <= this.lastTimestamp) {
          timestamp = Date.now();
        }
        this.lastTimestamp = timestamp;
      }
    } else {
      // 新的毫秒，重置序列号
      this.sequence = 0;
      this.lastTimestamp = currentTimestamp;
    }

    return this.flakeIdGen.next();
  }
}

// 全局单例
const snowflakeGenerator = new SnowflakeGenerator();

/**
 * Base62 字符集（按 ASCII 顺序：0-9A-Za-z）
 * 保证字典序与数字大小一致，从而保持时间排序
 */
const BASE62_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

/**
 * 将 BigInt 转换为 Base62 编码
 * @param num BigInt 数字
 * @returns Base62 字符串（约 11 个字符）
 */
function toBase62(num: bigint): string {
  if (num === 0n) return "0";

  let result = "";
  const base = BigInt(BASE62_CHARS.length);

  while (num > 0n) {
    const remainder = Number(num % base);
    result = BASE62_CHARS[remainder] + result;
    num = num / base;
  }

  return result;
}

/**
 * 生成一个雪花ID字符串（Base62 编码，约 11 个字符）
 *
 * @example
 * - 原始: "1234567890123456789" (19位数字)
 * - Base62: "AzL8n0Y58m7" (11个字符)
 *
 * 特点：
 * - 支持高并发批量生成
 * - 保证同一毫秒内生成的ID唯一
 * - 序列号用尽时自动等待下一毫秒
 */
function generateSnowflakeId(): string {
  const buffer = snowflakeGenerator.next();
  const bigIntId = BigInt(`0x${buffer.toString("hex")}`);
  return toBase62(bigIntId);
}

/**
 * 批量生成雪花ID
 * 用于批量插入场景，确保所有ID唯一
 *
 * @param count 生成数量
 * @returns ID数组
 *
 * @example
 * ```typescript
 * const ids = generateBatchSnowflakeIds(100);
 * const users = ids.map(id => ({ id, name: 'User' }));
 * await repository.insert(users);
 * ```
 */
function generateBatchSnowflakeIds(count: number): string[] {
  const ids: string[] = [];
  for (let i = 0; i < count; i++) {
    ids.push(generateSnowflakeId());
  }
  return ids;
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
 *   id: string;
 * }
 * ```
 */
export function SnowflakeId(): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    // 应用 @PrimaryColumn 装饰器（使用 varchar 存储 Base62 字符串）
    PrimaryColumn("varchar", { length: 20 })(target, propertyKey);

    // 在类的原型上添加或增强 BeforeInsert 钩子
    const prototype = target as Record<string, unknown>;
    const hookName = "__beforeInsertForSnowflake";

    if (!prototype[hookName]) {
      // 定义一个新的 BeforeInsert 方法
      prototype[hookName] = function (this: Record<string | symbol, unknown>) {
        if (!this[propertyKey]) {
          this[propertyKey] = generateSnowflakeId();
        }
      };

      // 应用 @BeforeInsert 装饰器
      BeforeInsert()(target, hookName);
    }
  };
}

export { generateSnowflakeId, generateBatchSnowflakeIds };
