import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class DebugMiddleware implements NestMiddleware {
  private readonly logger = new Logger('DebugMiddleware');

  use(req: Request, res: Response, next: NextFunction): void {
    // Debug para requests específicos - Puedes agregar más rutas según necesites
    const shouldDebug = this.shouldDebugRequest(req);

    if (shouldDebug) {
      this.logger.debug('=== DEBUG REQUEST ===');
      this.logger.debug(`URL: ${req.url}`);
      this.logger.debug(`Method: ${req.method}`);
      this.logger.debug(`Content-Type: ${req.headers['content-type']}`);
      this.logger.debug(`Body Type: ${typeof req.body}`);

      if (req.body && Object.keys(req.body).length > 0) {
        this.logger.debug(`Body Keys: ${Object.keys(req.body).join(', ')}`);
        this.logger.debug(`Body: ${JSON.stringify(req.body, null, 2)}`);
      }

      if (req.query && Object.keys(req.query).length > 0) {
        this.logger.debug(`Query Params: ${JSON.stringify(req.query, null, 2)}`);
      }

      this.logger.debug('=== END DEBUG ===');
    }

    next();
  }

  /**
   * Determina si se debe debuggear el request
   * Modifica esta función según tus necesidades
   */
  private shouldDebugRequest(req: Request): boolean {
    // Ejemplos de rutas que podrías querer debuggear en El Pedregal:

    // Debug para fuel-supply (abastecimiento de combustible)
    if (req.url.includes('/fuel-supply') && req.method === 'POST') {
      return true;
    }

    // Debug para consumo de combustible
    if (req.url.includes('/fuel-consumption') && req.method === 'POST') {
      return true;
    }

    // Debug para abastecimiento de puntos
    if (req.url.includes('/supply-points') && req.method === 'POST') {
      return true;
    }

    // Puedes agregar más condiciones según necesites
    // Por ejemplo, debuggear todos los POST en desarrollo:
    // if (process.env.NODE_ENV === 'development' && req.method === 'POST') {
    //   return true;
    // }

    return false;
  }
}
