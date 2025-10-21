import * as path from "node:path";
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { config } from "dotenv";

import { syncLocales } from "@meta-1/nest-common";
import { loadNacosConfig } from "@meta-1/nest-nacos";
import { AppModule } from "./app.module";
import { setupSwagger } from "./app.swagger";
import type { AppConfig } from "./app.types";

// 在最开始加载环境变量
config();

async function bootstrap() {
  const logger = new Logger("Main");
  // 同步 locales 文件（启动时同步 + 开发模式下监听）
  const isDevelopment = process.env.NODE_ENV === "development";
  logger.log(`Syncing locales in ${isDevelopment ? "development" : "production"} mode`);
  syncLocales({
    sourceDir: path.join(process.cwd(), "locales"),
    targetDir: path.join(process.cwd(), "dist/apps/server-authub/i18n"),
    watch: isDevelopment,
  });
  const nacosConfig = await loadNacosConfig<AppConfig>();
  if (!nacosConfig) {
    logger.warn("Starting application without Nacos configuration");
  }
  const app = await NestFactory.create(AppModule.forRoot(nacosConfig));
  app.enableCors({
    origin: true,
    credentials: true,
  });
  setupSwagger(app);
  await app.listen(process.env.PORT ?? 3100);
  logger.log(`Server is running on port ${process.env.PORT ?? 3100}`);
}
bootstrap();
