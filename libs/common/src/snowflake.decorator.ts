import FlakeId from "flake-idgen";
import { BeforeInsert, PrimaryColumn } from "typeorm";

const flakeIdGen = new FlakeId();

/**
 * 生成一个雪花ID字符串
 */
function generateSnowflakeId(): string {
  const buffer = flakeIdGen.next();
  return BigInt(`0x${buffer.toString("hex")}`).toString();
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
    // 应用 @PrimaryColumn 装饰器
    PrimaryColumn("bigint")(target, propertyKey);

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
