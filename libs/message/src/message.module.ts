import { DynamicModule, Module } from "@nestjs/common";

import { MailService } from "./mail";
import { MailCodeController, MailCodeService } from "./mail-code";
import { MESSAGE_CONFIG, MessageConfig } from "./shared";

@Module({})
export class MessageModule {
  static forRoot(config: MessageConfig): DynamicModule {
    return {
      module: MessageModule,
      global: true,
      providers: [
        MailService,
        MailCodeService,
        {
          provide: MESSAGE_CONFIG,
          useValue: config,
        },
      ],
      controllers: [MailCodeController],
      exports: [MailService, MailCodeService],
    };
  }
}
