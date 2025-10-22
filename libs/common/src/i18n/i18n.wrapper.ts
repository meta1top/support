import type { I18nContext as RawI18nContext, TranslateOptions } from "nestjs-i18n";

/**
 * I18n 上下文包装类
 * 自动为翻译 key 添加命名空间前缀
 */
export class I18nContext {
  constructor(
    private readonly context: RawI18nContext,
    private readonly namespace: string = "common",
  ) {}

  /**
   * 翻译文本
   * @param key - 翻译键（会自动添加命名空间前缀）
   * @param options - 翻译选项
   */
  t(key: string, options?: TranslateOptions): string {
    const fullKey = this.addNamespace(key);
    return this.context.t(fullKey, options);
  }

  /**
   * 翻译文本（别名）
   */
  translate(key: string, options?: TranslateOptions): string {
    return this.t(key, options);
  }

  /**
   * 获取当前语言
   */
  get lang(): string {
    return this.context.lang;
  }

  /**
   * 获取原始 I18nContext（用于高级用法）
   */
  get raw(): RawI18nContext {
    return this.context;
  }

  /**
   * 添加命名空间前缀
   */
  private addNamespace(key: string): string {
    // 如果 key 已经包含命名空间（带点），则不添加前缀
    if (key.includes(".")) {
      return key;
    }
    return `${this.namespace}.${key}`;
  }
}

/**
 * 创建 I18n 包装器
 */
export function createI18nContext(context: RawI18nContext, namespace: string = "common"): I18nContext {
  return new I18nContext(context, namespace);
}

// 重新导出原始类型（加别名）
export type { RawI18nContext };
export type { I18nValidationError, I18nValidationException, TranslateOptions } from "nestjs-i18n";
export { I18nService } from "nestjs-i18n";
