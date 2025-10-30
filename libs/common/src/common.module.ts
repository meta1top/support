import { Global, Module } from "@nestjs/common";
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE, DiscoveryModule } from "@nestjs/core";
import { ZodValidationPipe } from "nestjs-zod";

import { CacheableInitializer } from "./cache";
import { ErrorsFilter } from "./errors";
import { ResponseInterceptor } from "./interceptors";

@Global()
@Module({
  imports: [DiscoveryModule],
  providers: [
    CacheableInitializer,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
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
  exports: [],
})
export class CommonModule {}
