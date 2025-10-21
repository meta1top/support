import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

import { I18n, I18nContext } from "@meta-1/nest-common";

@ApiTags("默认接口")
@Controller()
export class AppController {
  @Get("/")
  @ApiOperation({ summary: "欢迎页面", description: "测试国际化功能" })
  async welcome(@I18n() i18n: I18nContext) {
    const message = i18n.t("欢迎使用 Prime Developer Server");
    const hello = i18n.t("你好，世界！");

    return {
      message,
      hello,
      currentLang: i18n.lang,
    };
  }
}
