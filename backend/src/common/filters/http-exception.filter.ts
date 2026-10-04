import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message = exception.message;
    let errors: string[] = [];

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const responseObj = exceptionResponse as {
        message?: string | string[];
        error?: string;
      };
      if (Array.isArray(responseObj.message)) {
        errors = responseObj.message;
        message = responseObj.error || '参数验证失败';
      } else if (responseObj.message) {
        message = responseObj.message;
      }
    }

    this.logger.error(
      `${request.method} ${request.url} - ${status} ${message}`,
    );

    response.status(status).json({
      code: status,
      message,
      errors,
      data: null,
    });
  }
}
