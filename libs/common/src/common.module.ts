import { Global, Module } from "@nestjs/common";
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE, DiscoveryModule } from "@nestjs/core";
import { ZodValidationPipe } from "nestjs-zod";

import { CacheableInitializer } from "./cache";
import { CommonConfigService } from "./config/common.config.service";
import { CommonRefreshService } from "./config/common.refresh.service";
import { ErrorsFilter } from "./errors";
import { AuthInterceptor, ResponseInterceptor } from "./interceptors";
import { EncryptService } from "./security";
import { SessionService } from "./session";
import { TokenService } from "./token";

@Global()
@Module({
  imports: [DiscoveryModule],
  providers: [
    EncryptService,
    CommonConfigService,
    CommonRefreshService,
    TokenService,
    SessionService,
    CacheableInitializer,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuthInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: ErrorsFilter,
    },
  ],
  exports: [EncryptService, CommonConfigService, CommonRefreshService, TokenService, SessionService],
})
export class CommonModule {}
