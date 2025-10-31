import { Global, Module, OnModuleInit } from "@nestjs/common";
import { APP_INTERCEPTOR, DiscoveryModule } from "@nestjs/core";
import { get } from "lodash";

import { NacosConfigService } from "@meta-1/nest-nacos";
import { SecurityConfigService } from "./config/security.config.service";
import { AuthInterceptor } from "./interceptors";
import { OTPService } from "./otp";
import { EncryptService } from "./security";
import { SessionService } from "./session";
import { SECURITY_CONFIG_KEY, SecurityConfig } from "./shared";
import { TokenService } from "./token";

@Global()
@Module({
  imports: [DiscoveryModule],
  providers: [
    EncryptService,
    SecurityConfigService,
    TokenService,
    SessionService,
    OTPService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuthInterceptor,
    },
  ],
  exports: [EncryptService, SecurityConfigService, TokenService, SessionService, OTPService],
})
export class SecurityModule implements OnModuleInit {
  constructor(
    private readonly nacosConfigService: NacosConfigService,
    private readonly securityConfigService: SecurityConfigService,
  ) {}

  onModuleInit() {
    this.nacosConfigService.subscribe<unknown>((config) => {
      const securityConfig = get(config, SECURITY_CONFIG_KEY);
      if (securityConfig) {
        const config = securityConfig as SecurityConfig;
        this.securityConfigService.set(config);
      }
    });
  }
}
