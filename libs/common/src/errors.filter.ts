import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";
import { Request, Response } from "express";

import { AppError } from "./app.error";

@Catch()
export class ErrorsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 默认值
    let code = 0;
    let message = "Server Error";
    let data = null;

    if (exception instanceof AppError) {
      code = exception.code;
      message = exception.message;
      data = exception.data;
    } else if (exception instanceof HttpException) {
      const res = exception.getResponse();
      // biome-ignore lint/suspicious/noExplicitAny: res
      message = typeof res === "string" ? res : (res as any).message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    response.status(200).json({
      code,
      success: false,
      message,
      data,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
