import { Global, Module } from "@nestjs/common";

import { MessageConfigService } from "./config/message.config.service";
import { MessageRefreshService } from "./config/message.refresh.service";
import { MailService } from "./mail";
import { MailCodeController, MailCodeService } from "./mail-code";

@Global()
@Module({
  providers: [MailService, MailCodeService, MessageConfigService, MessageRefreshService],
  controllers: [MailCodeController],
  exports: [MailService, MailCodeService, MessageConfigService, MessageRefreshService],
})
export class MessageModule {}
