/**
 * 分布式锁错误码定义
 *
 * 错误码范围：100-199
 */
export const LockErrorCode = {
  // Redis 相关错误 (100-109)
  REDIS_NOT_INJECTED: {
    code: 100,
    message: "Redis 未注入。请确保已配置 Redis 并使用 LockInitializer 初始化分布式锁。",
  },

  // 锁操作相关错误 (110-119)
  LOCK_ACQUIRE_FAILED: {
    code: 110,
    message: "获取锁失败，操作正在处理中，请稍后重试。",
  },
  LOCK_ACQUIRE_ERROR: {
    code: 111,
    message: "获取锁时发生错误。",
  },
  LOCK_RELEASE_ERROR: {
    code: 112,
    message: "释放锁时发生错误。",
  },
} as const;
