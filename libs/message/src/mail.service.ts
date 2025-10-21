import Dm20151123, * as $Dm20151123 from "@alicloud/dm20151123";
import * as $OpenApi from "@alicloud/openapi-client";
import { SESv2Client, SendEmailCommand, type SendEmailCommandInput } from "@aws-sdk/client-sesv2";
import { Inject, Injectable, Logger } from "@nestjs/common";

import { MESSAGE_CONFIG } from "./message.consts";
import type { MessageConfig } from "./message.types";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string | string[];
}

type MailProvider = "aws-ses" | "alc-dm";

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private provider: MailProvider | null = null;
  private sesClient: SESv2Client | null = null;
  private dmClient: Dm20151123 | null = null;
  private fromEmail: string | null = null;
  private fromAlias?: string;

  /**
   * 构建阿里云邮件推送的 endpoint
   * @param region 区域代码
   * @returns endpoint 地址
   */
  private buildAliyunDmEndpoint(region: string): string {
    // 华东1（杭州）是默认区域，使用简化的 endpoint
    if (region === "cn-hangzhou") {
      return "dm.aliyuncs.com";
    }
    // 其他区域使用区域前缀
    // 例如：cn-shanghai, ap-southeast-1, ap-southeast-2 等
    return `dm.${region}.aliyuncs.com`;
  }

  constructor(@Inject(MESSAGE_CONFIG) config: MessageConfig) {
    const mailConfig = config.mail;

    if (mailConfig.type === "aws-ses") {
      this.provider = "aws-ses";
      this.sesClient = new SESv2Client({
        credentials: {
          accessKeyId: mailConfig.ses.accessKeyId,
          secretAccessKey: mailConfig.ses.accessKeySecret,
        },
        region: mailConfig.ses.region,
      });
      this.fromEmail = mailConfig.ses.fromEmail;
      this.logger.log(`MailService 初始化成功，使用 AWS SES，区域: ${mailConfig.ses.region}`);
    } else if (mailConfig.type === "alc-dm") {
      this.provider = "alc-dm";
      // 根据 region 构建正确的 endpoint
      const endpoint = this.buildAliyunDmEndpoint(mailConfig.dm.region);
      const dmConfig = new $OpenApi.Config({
        accessKeyId: mailConfig.dm.accessKeyId,
        accessKeySecret: mailConfig.dm.accessKeySecret,
        endpoint: endpoint,
      });
      this.dmClient = new Dm20151123(dmConfig);
      this.fromEmail = mailConfig.dm.fromEmail;
      this.fromAlias = mailConfig.dm.fromAlias;
      this.logger.log(
        `MailService 初始化成功，使用阿里云邮件推送，区域: ${mailConfig.dm.region}，Endpoint: ${endpoint}`,
      );
    } else {
      this.logger.warn("MailService 未配置或配置不完整");
    }
  }

  /**
   * 发送邮件
   * @param options 邮件选项
   * @returns 邮件发送结果
   */
  async sendEmail(options: SendEmailOptions): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    if (!this.provider || !this.fromEmail) {
      const error = "邮件服务未正确配置";
      this.logger.error(error);
      return { success: false, error };
    }

    // 验证至少有 html 或 text 内容
    if (!options.html && !options.text) {
      const error = "邮件内容不能为空，至少需要提供 html 或 text";
      this.logger.error(error);
      return { success: false, error };
    }

    try {
      if (this.provider === "aws-ses") {
        return await this.sendEmailViaSES(options);
      }
      if (this.provider === "alc-dm") {
        return await this.sendEmailViaDM(options);
      }
      return { success: false, error: "未知的邮件服务提供商" };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "未知错误";
      this.logger.error(`邮件发送失败: ${errorMessage}`, error);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * 使用 AWS SES 发送邮件
   */
  private async sendEmailViaSES(
    options: SendEmailOptions,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.sesClient || !this.fromEmail) {
      return { success: false, error: "AWS SES 客户端未初始化" };
    }

    const { to, subject, html, text, cc, bcc, replyTo } = options;

    // 构建邮件内容
    const emailBody: {
      Html?: { Data: string; Charset: string };
      Text?: { Data: string; Charset: string };
    } = {};

    if (html) {
      emailBody.Html = {
        Data: html,
        Charset: "UTF-8",
      };
    }

    if (text) {
      emailBody.Text = {
        Data: text,
        Charset: "UTF-8",
      };
    }

    const content: SendEmailCommandInput["Content"] = {
      Simple: {
        Subject: {
          Data: subject,
          Charset: "UTF-8",
        },
        Body: emailBody,
      },
    };

    // 构建发送命令参数
    const params: SendEmailCommandInput = {
      FromEmailAddress: this.fromEmail,
      Destination: {
        ToAddresses: Array.isArray(to) ? to : [to],
        CcAddresses: cc ? (Array.isArray(cc) ? cc : [cc]) : undefined,
        BccAddresses: bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : undefined,
      },
      Content: content,
      ReplyToAddresses: replyTo ? (Array.isArray(replyTo) ? replyTo : [replyTo]) : undefined,
    };

    const command = new SendEmailCommand(params);
    const result = await this.sesClient.send(command);

    this.logger.log(
      `邮件发送成功 (AWS SES)，收件人: ${Array.isArray(to) ? to.join(", ") : to}，MessageId: ${result.MessageId}`,
    );

    return {
      success: true,
      messageId: result.MessageId,
    };
  }

  /**
   * 使用阿里云邮件推送发送邮件
   */
  private async sendEmailViaDM(
    options: SendEmailOptions,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.dmClient || !this.fromEmail) {
      return { success: false, error: "阿里云邮件推送客户端未初始化" };
    }

    const { to, subject, html, text, replyTo } = options;

    // 阿里云邮件推送的单批邮件接口
    const toAddresses = Array.isArray(to) ? to.join(",") : to;
    const replyToAddress = replyTo ? (Array.isArray(replyTo) ? replyTo[0] : replyTo) : undefined;

    // 构建请求
    const request = new $Dm20151123.SingleSendMailRequest({
      accountName: this.fromEmail,
      addressType: 1, // 1: 随机账号, 0: 发信地址
      replyToAddress: !!replyToAddress,
      replyAddress: replyToAddress,
      fromAlias: this.fromAlias, // 发件人别名
      toAddress: toAddresses,
      subject: subject,
      htmlBody: html,
      textBody: text,
    });

    const result = await this.dmClient.singleSendMail(request);

    this.logger.log(`邮件发送成功 (阿里云 DM)，收件人: ${toAddresses}，EnvId: ${result.body?.envId}`);

    return {
      success: true,
      messageId: result.body?.envId,
    };
  }

  /**
   * 发送验证码邮件
   * @param to 收件人邮箱
   * @param code 验证码
   * @param expiryMinutes 过期时间（分钟）
   */
  async sendVerificationCode(
    to: string,
    code: string,
    expiryMinutes = 10,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: #f9f9f9;
              border-radius: 8px;
              padding: 30px;
              margin: 20px 0;
            }
            .code {
              background: #fff;
              border: 2px solid #e0e0e0;
              border-radius: 6px;
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 8px;
              padding: 20px;
              text-align: center;
              margin: 30px 0;
              color: #1976d2;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 12px;
              margin: 20px 0;
              font-size: 14px;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e0e0e0;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2 style="color: #1976d2; margin-top: 0;">您的验证码</h2>
            <p>您好，</p>
            <p>您正在进行身份验证，请使用以下验证码完成操作：</p>
            <div class="code">${code}</div>
            <div class="warning">
              ⚠️ 此验证码将在 <strong>${expiryMinutes} 分钟</strong>后过期，请尽快使用。
            </div>
            <p>如果这不是您本人的操作，请忽略此邮件。</p>
            <div class="footer">
              <p>此邮件由系统自动发送，请勿直接回复。</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
您的验证码是: ${code}

此验证码将在 ${expiryMinutes} 分钟后过期。

如果这不是您本人的操作，请忽略此邮件。
    `;

    return this.sendEmail({
      to,
      subject: "验证码 - 请验证您的身份",
      html,
      text,
    });
  }
}
