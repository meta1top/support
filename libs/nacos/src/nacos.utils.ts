import { Logger } from "@nestjs/common";
import { NacosConfigClient } from "nacos";
import yaml from "yaml";

/**
 * 将 kebab-case 字符串转换为 camelCase
 */
function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * 递归转换对象的所有键名从 kebab-case 到 camelCase
 */
// biome-ignore lint/suspicious/noExplicitAny: generic config transformation
function transformKeys(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => transformKeys(item));
  }

  if (typeof obj === "object" && obj.constructor === Object) {
    const transformed: Record<string, unknown> = {};
    for (const key in obj) {
      if (Object.hasOwn(obj, key)) {
        const camelKey = kebabToCamel(key);
        transformed[camelKey] = transformKeys(obj[key]);
      }
    }
    return transformed;
  }

  return obj;
}

export async function loadNacosConfig<T>(): Promise<T | null> {
  const logger = new Logger("NacosPreloader");

  try {
    logger.log("Loading Nacos configuration...");

    const client = new NacosConfigClient({
      serverAddr: process.env.NACOS_SERVER!,
      namespace: process.env.NACOS_NAMESPACE || "public",
      username: process.env.NACOS_USERNAME,
      password: process.env.NACOS_PASSWORD,
    });

    const content = await client.getConfig(process.env.APP_NAME!, process.env.NACOS_GROUP ?? "DEFAULT_GROUP");

    const parsed = yaml.parse(content);
    const config = transformKeys(parsed) as T;
    logger.log("Nacos configuration loaded successfully");

    // 关闭客户端，NacosModule 会重新创建用于监听变更
    client.close();

    return config;
  } catch (error) {
    logger.error("Failed to load Nacos configuration", error);
    return null;
  }
}

/**
 * 导出工具函数供其他地方使用
 */
export { transformKeys, kebabToCamel };
