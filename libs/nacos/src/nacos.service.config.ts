import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NacosConfigClient } from "nacos";
import yaml from "yaml";

import { NACOS_CONFIG, NACOS_MODULE_OPTIONS } from "./nacos.const";
import type { NacosModuleOptions } from "./nacos.types";
import { transformKeys } from "./nacos.utils";

@Injectable()
export class NacosConfigService implements OnModuleInit, OnModuleDestroy {
  private client: NacosConfigClient;
  private readonly logger = new Logger(NacosConfigService.name);

  constructor(
    private readonly configService: ConfigService,
    @Inject(NACOS_MODULE_OPTIONS) private readonly options: NacosModuleOptions,
  ) {}

  async onModuleInit() {
    this.logger.log("Initializing Nacos config listener...");

    this.client = new NacosConfigClient({
      serverAddr: this.options.server,
      namespace: this.options.namespace || "public",
      username: this.options.username,
      password: this.options.password,
    });

    // 注意：配置已在 main.ts 中预加载，这里只订阅配置变更
    this.client.subscribe(
      {
        dataId: this.options.config.dataId,
        group: this.options.config.group ?? "DEFAULT_GROUP",
      },
      // biome-ignore lint/suspicious/noExplicitAny: content
      (content: any) => {
        this.logger.log("Nacos config updated, refreshing...");
        const json = this.parseYaml(content);
        this.configService.set(NACOS_CONFIG, json);
      },
    );

    this.logger.log("NacosConfigService initialized (listening for config changes)");
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.unsubscribe({
        dataId: this.options.config.dataId,
        group: this.options.config.group ?? "DEFAULT_GROUP",
      });
      this.client.close();
    }
    this.logger.log("NacosConfigService destroyed");
  }

  subscribe(listener: (content: string) => void) {
    this.client.subscribe(
      {
        dataId: this.options.config.dataId,
        group: this.options.config.group ?? "DEFAULT_GROUP",
      },
      listener,
    );
  }

  private parseYaml(content: string) {
    try {
      const parsed = yaml.parse(content);
      return transformKeys(parsed);
    } catch (error) {
      this.logger.error("parseYaml error", error);
      return null;
    }
  }

  get<T>(): T | undefined {
    return this.configService.get<T>(NACOS_CONFIG);
  }
}
