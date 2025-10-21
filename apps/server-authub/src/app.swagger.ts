import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export const setupSwagger = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle("Meta1 Developer Server")
    .setDescription("The Meta1 Developer Server API description")
    .setVersion("1.0")
    .addTag("Meta1 Developer Server")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "Authorization",
        description: "输入 JWT token",
        in: "header",
      },
      "bearer",
    )
    .addApiKey(
      {
        type: "apiKey",
        name: "Accept-Language",
        in: "header",
        description: "语言设置 (例如: zh-CN, en)",
      },
      "Accept-Language",
    )
    .build();

  // 创建文档
  const document = SwaggerModule.createDocument(app, config);

  // 全局应用安全方案：所有接口都自动带上这两个 header
  document.security = [
    { bearer: [] }, // 全局应用 Bearer token
    { "Accept-Language": [] }, // 全局应用 Accept-Language
  ];

  SwaggerModule.setup("docs", app, document, {
    swaggerOptions: {
      persistAuthorization: true, // 持久化认证信息
    },
  });
};
