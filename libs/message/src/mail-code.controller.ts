import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

import { SendCodeDto } from "./mail-code.dto";
import { MailCodeService } from "./mail-code.service";

/**
 * 邮件服务控制器
 * 提供邮件验证码相关的 API 接口
 */
@ApiTags("邮件服务")
@Controller("/api/mail/code")
export class MailCodeController {
  constructor(private readonly mailCodeService: MailCodeService) {}

  @Post("/send")
  @ApiOperation({
    summary: "发送验证码",
  })
  async sendCode(@Body() body: SendCodeDto) {
    await this.mailCodeService.send(body);
  }
}
