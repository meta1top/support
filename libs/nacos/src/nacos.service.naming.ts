import os from "node:os";
import { format } from "node:util";
import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Hosts, NacosNamingClient } from "nacos";
import { v4 as uuidv4 } from "uuid";

import { NACOS_MODULE_OPTIONS } from "./nacos.const";
import type { NacosModuleOptions } from "./nacos.types";

@Injectable()
export class NacosNamingService implements OnModuleInit, OnModuleDestroy {
  private client: NacosNamingClient;
  private readonly logger = new Logger(NacosNamingService.name);

  constructor(
    private readonly configService: ConfigService,
    @Inject(NACOS_MODULE_OPTIONS) private readonly options: NacosModuleOptions,
  ) {}

  async onModuleInit() {
    this.client = new NacosNamingClient({
      logger: {
        info: (...args: unknown[]) => this.logger.log(format(...args)),
        warn: (...args: unknown[]) => this.logger.warn(format(...args)),
        error: (...args: unknown[]) => this.logger.error(format(...args)),
        debug: (...args: unknown[]) => this.logger.debug(format(...args)),
      } as typeof console,
      serverList: this.options.server,
      namespace: this.options.namespace || "public",
      username: this.options.username,
      password: this.options.password,
    });
    await this.client.ready();
    await this.register();
    this.logger.log("NacosNamingService initialized");
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.deregisterInstance(this.options.naming.serviceName, {
        instanceId: uuidv4(),
        healthy: true,
        enabled: true,
        ip: this.options.naming.ip ?? this.getCurrentIp(),
        port: this.configService.get<number>("PORT") ?? 3000,
      });
    }
    this.logger.log("NacosNamingService destroyed");
  }

  private async register() {
    await this.client.registerInstance(this.options.naming.serviceName, {
      instanceId: uuidv4(),
      healthy: true,
      enabled: true,
      ip: this.options.naming.ip ?? this.getCurrentIp(),
      port: this.configService.get<number>("PORT") ?? 3000,
    });
  }

  private getCurrentIp() {
    return os.networkInterfaces().en0?.[0]?.address ?? "127.0.0.1";
  }

  subscribe(serviceName: string, listener: (instances: Hosts) => void) {
    this.client.subscribe(serviceName, listener);
  }
}
