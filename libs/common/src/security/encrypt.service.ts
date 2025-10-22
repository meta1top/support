import { createCipheriv, randomBytes } from "node:crypto";
import { Injectable, Logger } from "@nestjs/common";
import * as forge from "node-forge";

import { AppError, ErrorCode } from "../errors";

@Injectable()
export class EncryptService {
  private readonly logger = new Logger(EncryptService.name);
  /**
   * 使用 RSA 私钥解密（兼容前端 JSEncrypt）
   * @param encryptedText 前端使用公钥加密的 Base64 字符串
   * @param privateKey RSA 私钥（PEM 格式）
   * @returns 解密后的原始文本
   */
  decryptWithPrivateKey(encryptedText: string, privateKey: string): string {
    try {
      // 使用 node-forge 库（纯 JS 实现），与前端 JSEncrypt 兼容（PKCS1 v1.5）
      const rsaPrivateKey = forge.pki.privateKeyFromPem(privateKey);
      const encrypted = forge.util.decode64(encryptedText);
      // JSEncrypt 使用 PKCS1 v1.5 padding（node-forge 默认）
      const decrypted = rsaPrivateKey.decrypt(encrypted);
      return decrypted;
    } catch (error) {
      this.logger.error("RSA 解密失败:", error);
      throw new AppError(ErrorCode.DECRYPT_ERROR);
    }
  }

  /**
   * 使用 AES-256-CBC 加密密码
   * @param text 原始密码
   * @param aesKey AES 密钥 (32 字节)
   * @returns 加密后的密码 (格式: iv:encryptedData，均为 Base64 编码)
   */
  encryptWithAES(text: string, aesKey: string): string {
    try {
      // 生成随机 IV (初始化向量)
      const iv = randomBytes(16);

      // 确保 aesKey 是 32 字节 (256 位)
      const key = Buffer.from(aesKey, "utf8").subarray(0, 32);

      // 创建加密器
      const cipher = createCipheriv("aes-256-cbc", key, iv);

      // 加密
      let encrypted = cipher.update(text, "utf8", "base64");
      encrypted += cipher.final("base64");

      // 返回格式: iv:encryptedData (都是 Base64 编码)
      return `${iv.toString("base64")}:${encrypted}`;
    } catch (error) {
      this.logger.error("AES 加密失败:", error);
      throw new AppError(ErrorCode.AES_ENCRYPT_ERROR);
    }
  }
}
