export type JwtConfig = {
  secret: string;
  expiresIn?: number;
};

export type CommonConfig = {
  jwt: JwtConfig;
};
