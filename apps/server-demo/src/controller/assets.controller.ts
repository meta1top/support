import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

import {
  AssetsService,
  PresignedDownloadUrlRequest,
  PresignedDownloadUrlResponse,
  PresignedUploadUrlRequest,
  PresignedUploadUrlResponse,
} from "@meta-1/nest-assets";
import { Public } from "@meta-1/nest-security";

/**
 * 资源服务控制器
 * 提供文件上传和下载的预签名 URL API 接口
 */
@ApiTags("AssetsController")
@Controller("/api/assets")
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Public()
  @Post("/pre-sign/upload")
  @ApiOperation({
    summary: "生成预签名上传 URL",
    description: "获取文件上传的预签名 URL，支持 S3 和 OSS",
  })
  async generateUploadUrl(@Body() body: PresignedUploadUrlRequest): Promise<PresignedUploadUrlResponse> {
    return this.assetsService.generatePresignedUploadUrl(body);
  }

  @Public()
  @Post("/pre-sign/download")
  @ApiOperation({
    summary: "生成预签名下载 URL",
    description: "获取私有文件的预签名下载 URL，支持 S3 和 OSS",
  })
  async generateDownloadUrl(@Body() body: PresignedDownloadUrlRequest): Promise<PresignedDownloadUrlResponse> {
    return this.assetsService.generatePresignedDownloadUrl(body);
  }
}
