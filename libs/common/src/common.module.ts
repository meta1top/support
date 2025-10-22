import { Module } from "@nestjs/common";

import { EncryptService } from "./security";

@Module({
  providers: [EncryptService],
  exports: [EncryptService],
})
export class CommonModule {}
