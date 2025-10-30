import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

import { Public } from "@meta-1/nest-security";
import { SendCodeDto } from "./mail-code.dto";
import { MailCodeService } from "./mail-code.service";

/**
 * 邮件服务控制器
 * 提供邮件验证码相关的 API 接口
 */
@ApiTags("MailCodeController")
@Controller("/api/mail/code")
export class MailCodeController {
  constructor(private readonly mailCodeService: MailCodeService) {}

  @Public()
  @Post("/send")
  @ApiOperation({
    summary: "发送验证码",
  })
  async sendCode(@Body() body: SendCodeDto) {
    await this.mailCodeService.send(body);
  }
}
