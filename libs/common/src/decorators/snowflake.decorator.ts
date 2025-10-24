import FlakeId from "flake-idgen";
import { BeforeInsert, PrimaryColumn } from "typeorm";

const flakeIdGen = new FlakeId();

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
 */
function generateSnowflakeId(): string {
  const buffer = flakeIdGen.next();
  const bigIntId = BigInt(`0x${buffer.toString("hex")}`);
  return toBase62(bigIntId);
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

export { generateSnowflakeId };
