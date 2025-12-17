import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger, HttpException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, ip } = request;
    const userAgent = request.get('User-Agent') || '';

    const startTime = Date.now();

    this.logger.log(`${method} ${url} - ${ip} - ${userAgent}`);

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const { statusCode } = response;

          this.logger.log(`${method} ${url} - ${statusCode} - ${duration}ms - ${ip}`);
        },
        error: (error: Error | HttpException) => {
          const duration = Date.now() - startTime;
          // ✅ CORRECCIÓN: Verificar el tipo de error correctamente
          const statusCode = error instanceof HttpException ? error.getStatus() : 500;
          const errorMessage = error?.message || 'Unknown error';

          this.logger.error(`${method} ${url} - ${statusCode} - ${duration}ms - ${ip} - Error: ${errorMessage}`);
        },
      }),
    );
  }
}
