export type NacosModuleOptions = {
  server: string;
  namespace?: string;
  username?: string;
  password?: string;
  naming: {
    group?: string;
    serviceName: string;
    ip?: string;
  };
  config: {
    group?: string;
    dataId: string;
  };
};
