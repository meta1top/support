import type { DataSource, Repository } from "typeorm";

// biome-ignore lint/suspicious/noExplicitAny: 装饰器需要使用动态类型
type ServiceWithRepository = { repository: Repository<any> };

/**
 * 事务装饰器 - 自动为方法添加数据库事务支持
 *
 * 使用方式:
 * ```typescript
 * @Transactional()
 * async register(dto: RegisterDto): Promise<Token> {
 *   // 方法内的所有数据库操作都会在同一个事务中执行
 *   // 如果抛出错误，事务会自动回滚
 * }
 * ```
 *
 * 注意事项:
 * 1. 该装饰器会自动注入 DataSource 实例
 * 2. 方法内抛出的任何错误都会触发回滚
 * 3. 只有方法正常返回时事务才会提交
 */
export function Transactional() {
  return (_target: unknown, _propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value as (
      // biome-ignore lint/suspicious/noExplicitAny: 装饰器参数类型未知
      ...args: any[]
    ) => Promise<unknown>;

    // biome-ignore lint/suspicious/noExplicitAny: 装饰器实现需要动态 this 上下文
    descriptor.value = async function (this: ServiceWithRepository, ...args: any[]) {
      // 获取 DataSource 实例
      // 在 NestJS 中，DataSource 会被注入到 service 的 repository.manager.connection
      const dataSource: DataSource = this.repository?.manager?.connection as DataSource;

      if (!dataSource) {
        throw new Error(
          "@Transactional() 装饰器要求 service 中必须注入 Repository。\n" +
            "请确保在 service 中使用 @InjectRepository() 注入了 Repository。",
        );
      }

      // 创建 QueryRunner 并开启事务
      const queryRunner = dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // 临时替换 repository 为事务中的 repository
        const originalRepository = this.repository;
        this.repository = queryRunner.manager.getRepository(originalRepository.target);

        // 执行原始方法
        const result = await originalMethod.apply(this, args);

        // 提交事务
        await queryRunner.commitTransaction();

        // 恢复原始 repository
        this.repository = originalRepository;

        return result;
      } catch (error) {
        // 回滚事务
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        // 释放 QueryRunner
        await queryRunner.release();
      }
    };

    return descriptor;
  };
}
