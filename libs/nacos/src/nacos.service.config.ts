import { Inject, Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NacosConfigClient } from "nacos";
import yaml from "yaml";

import { NACOS_CONFIG, NACOS_MODULE_OPTIONS } from "./nacos.const";
import type { NacosModuleOptions } from "./nacos.types";
import { transformKeys } from "./nacos.utils";

@Injectable()
export class NacosConfigService implements OnModuleDestroy {
  private client: NacosConfigClient;
  private readonly logger = new Logger(NacosConfigService.name);

  constructor(
    private readonly configService: ConfigService,
    @Inject(NACOS_MODULE_OPTIONS) private readonly options: NacosModuleOptions,
  ) {
    this.initializeClient();
  }

  private initializeClient() {
    this.logger.log("Initializing Nacos config listener...");
    this.client = new NacosConfigClient({
      serverAddr: this.options.server,
      namespace: this.options.namespace || "public",
      username: this.options.username,
      password: this.options.password,
    });
    this.subscribe((content) => {
      this.configService.set(NACOS_CONFIG, content);
    });
    this.logger.log("NacosConfigService initialized");
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

  subscribe<T>(listener: (content: T) => void) {
    this.client.subscribe(
      {
        dataId: this.options.config.dataId,
        group: this.options.config.group ?? "DEFAULT_GROUP",
      },
      (originalContent: string) => {
        const content = this.parseYaml(originalContent);
        listener(content as T);
      },
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
