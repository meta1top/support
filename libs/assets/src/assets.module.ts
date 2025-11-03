import { Global, Module, OnModuleInit } from "@nestjs/common";
import { get } from "lodash";

import { NacosConfigService } from "@meta-1/nest-nacos";
import { AssetsService } from "./assets.service";
import { AssetsConfigService } from "./config";
import { OSSService } from "./oss";
import { S3Service } from "./s3";
import { ASSETS_CONFIG_KEY, type AssetsConfig } from "./shared";

@Global()
@Module({
  providers: [AssetsConfigService, S3Service, OSSService, AssetsService],
  exports: [AssetsService, AssetsConfigService],
})
export class AssetsModule implements OnModuleInit {
  constructor(
    private readonly nacosConfigService: NacosConfigService,
    private readonly assetsConfigService: AssetsConfigService,
    private readonly assetsService: AssetsService,
  ) {}

  onModuleInit() {
    this.nacosConfigService.subscribe<unknown>((config) => {
      const assetsConfig = get(config, ASSETS_CONFIG_KEY);
      if (assetsConfig) {
        const config = assetsConfig as AssetsConfig;
        this.assetsConfigService.set(config);
        this.assetsService.refresh(config);
      }
    });
  }
}
