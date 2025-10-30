import { Global, Module, OnModuleInit } from "@nestjs/common";
import { get } from "lodash";

import { NacosConfigService } from "@meta-1/nest-nacos";
import { MessageConfigService } from "./config";
import { MailService } from "./mail";
import { MailCodeController, MailCodeService } from "./mail-code";
import { MESSAGE_CONFIG_KEY, MessageConfig } from "./shared";

@Global()
@Module({
  providers: [MailService, MailCodeService, MessageConfigService],
  controllers: [MailCodeController],
  exports: [MailService, MailCodeService, MessageConfigService],
})
export class MessageModule implements OnModuleInit {
  constructor(
    private readonly nacosConfigService: NacosConfigService,
    private readonly messageConfigService: MessageConfigService,
    private readonly mailService: MailService,
  ) {}
  onModuleInit() {
    this.nacosConfigService.subscribe<unknown>((config) => {
      const messageConfig = get(config, MESSAGE_CONFIG_KEY);
      if (messageConfig) {
        const config = messageConfig as MessageConfig;
        this.messageConfigService.set(config);
        this.mailService.refresh(config);
      }
    });
  }
}
