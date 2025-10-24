import type ms from "ms";

export type JwtConfig = {
  secret: string;
  expiresIn?: ms.StringValue;
};

export type CommonConfig = {
  jwt: JwtConfig;
};
