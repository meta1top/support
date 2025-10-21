import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { I18nContext as RawI18nContext } from "nestjs-i18n";

import { I18nContext } from "./i18n.wrapper";

/**
 * I18n 装饰器（包装版）
 * 自动为翻译 key 添加 common. 命名空间前缀
 *
 * @example
 * ```typescript
 * @Get()
 * async hello(@I18n() i18n: I18nContext) {
 *   // 自动添加 common. 前缀
 *   return i18n.t('你好，世界！'); // 实际查找 common.你好，世界！
 * }
 * ```
 */
export const I18n = createParamDecorator((namespace: string = "common", ctx: ExecutionContext): I18nContext => {
  const rawContext = RawI18nContext.current(ctx);
  if (!rawContext) {
    throw new Error("I18nContext not found. Make sure I18nModule is properly configured.");
  }
  return new I18nContext(rawContext, namespace);
});
