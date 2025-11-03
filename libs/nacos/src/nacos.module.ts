import { DynamicModule, Module } from "@nestjs/common";

import { NACOS_MODULE_OPTIONS } from "./nacos.const";
import { NacosConfigService } from "./nacos.service.config";
import { NacosNamingService } from "./nacos.service.naming";
import { NacosModuleOptions } from "./nacos.types";

@Module({})
export class NacosModule {
  static forRoot(options: NacosModuleOptions, global = true): DynamicModule {
    return {
      global,
      module: NacosModule,
      providers: [
        {
          provide: NACOS_MODULE_OPTIONS,
          useValue: options,
        },
        NacosNamingService,
        NacosConfigService,
      ],
      exports: [NacosNamingService, NacosConfigService],
    };
  }
}
