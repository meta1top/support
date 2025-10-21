import { RedisClusterOptions, RedisSingleOptions } from "@nestjs-modules/ioredis";

export type DatabaseConfig = {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize?: boolean;
  logging?: boolean;
};

export type RedisConfig = RedisSingleOptions | RedisClusterOptions;

export type AppConfig = {
  database: DatabaseConfig;
  redis: RedisConfig;
};
