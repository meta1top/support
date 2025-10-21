import { DynamicModule, Module } from "@nestjs/common";

import { MailService } from "./mail.service";
import { MailCodeController } from "./mail-code.controller";
import { MailCodeService } from "./mail-code.service";
import { MESSAGE_CONFIG } from "./message.consts";
import { MessageConfig } from "./message.types";

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
