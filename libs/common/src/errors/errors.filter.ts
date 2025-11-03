import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from "@nestjs/common";
import { Request, Response } from "express";
import { ZodValidationException } from "nestjs-zod";

import { AppError } from "./app.error";

@Catch()
export class ErrorsFilter implements ExceptionFilter {
  private logger = new Logger(ErrorsFilter.name);
  catch(exception: unknown, host: ArgumentsHost) {
    this.logger.error(exception);
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
    } else if (exception instanceof ZodValidationException) {
      // biome-ignore lint/suspicious/noExplicitAny: <getResponse>
      const res = exception.getResponse() as any;
      message = res.message || "Validation failed";
      data = res.errors || null;
    } else if (exception instanceof HttpException) {
      const res = exception.getResponse();
      // biome-ignore lint/suspicious/noExplicitAny: res
      message = typeof res === "string" ? res : (res as any).message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const error = {
      code,
      success: false,
      message,
      data,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(200).json(error);
  }
}
