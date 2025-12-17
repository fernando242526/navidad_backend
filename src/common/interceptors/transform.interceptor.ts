import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToInstance, ClassConstructor } from 'class-transformer';
import { Request } from 'express';

export interface Response<T> {
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest<Request>();

    // No procesar requests de FormData/multipart
    const contentType: string | undefined = request.headers['content-type'];

    if (contentType?.includes('multipart/form-data')) {
      // Castear el tipo de retorno para FormData
      return next.handle() as Observable<Response<T>>;
    }

    return next.handle().pipe(
      map((data: unknown): Response<T> => {
        // Si los datos ya tienen la estructura de BaseResponseDto, devolverlos tal como están
        if (this.isResponse(data)) {
          return data;
        }

        // Aplicar transformaciones de class-transformer solo para responses JSON
        if (data && typeof data === 'object') {
          // Verificar que data tenga un constructor válido
          const DataConstructor = this.getConstructor(data);

          if (DataConstructor) {
            return plainToInstance(DataConstructor, data, {
              excludeExtraneousValues: true,
              enableImplicitConversion: true,
            });
          }
        }

        // Si no es un objeto transformable, retornar como está
        return data as Response<T>;
      }),
    );
  }

  /**
   * Type guard para verificar si el data ya es un Response
   */
  private isResponse(data: unknown): data is Response<T> {
    return data !== null && typeof data === 'object' && 'data' in data && 'message' in data;
  }

  /**
   * Obtiene el constructor del objeto de forma segura
   */
  private getConstructor(data: object): ClassConstructor<Response<T>> | null {
    // Necesitamos acceder al constructor de un objeto desconocido
    // No tomar en cuenta el error
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const constructor = (data as any).constructor;

    // Verificar que el constructor existe y no es el Object genérico
    if (constructor && constructor !== Object && typeof constructor === 'function') {
      return constructor as ClassConstructor<Response<T>>;
    }

    return null;
  }
}
