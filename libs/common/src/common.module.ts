import { Global, Module } from "@nestjs/common";

import { CommonConfigService } from "./config/common.config.service";
import { CommonRefreshService } from "./config/common.refresh.service";
import { EncryptService } from "./security";

@Global()
@Module({
  providers: [EncryptService, CommonConfigService, CommonRefreshService],
  exports: [EncryptService, CommonConfigService, CommonRefreshService],
})
export class CommonModule {}
