export type SesConfig = {
  accessKeyId: string;
  accessKeySecret: string;
  region: string;
  fromEmail: string;
};

export type DmConfig = {
  accessKeyId: string;
  accessKeySecret: string;
  region: string; // 区域代码，如: cn-hangzhou, ap-southeast-1, ap-southeast-2
  fromEmail: string;
  fromAlias?: string; // 发件人别名（可选）
};

export type MessageConfig = {
  debug?: boolean; // 是否开启调试模式
  code?: string; // 验证码 123456，如何设定且debug为true，则不真实发送验证码
  mail:
    | {
        type: "aws-ses";
        ses: SesConfig;
      }
    | {
        type: "alc-dm";
        dm: DmConfig;
      };
};
