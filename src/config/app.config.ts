import { ConfigService } from '@nestjs/config';

export const getAppConfig = (configService: ConfigService) => {
  const corsOriginEnv = configService.get<string>('CORS_ORIGIN', 'http://localhost:4200');

  // Array de orígenes permitidos
  const corsOrigin = [
    corsOriginEnv, // Tu valor configurado (ej: https://elpedregal.com)
    'http://localhost:4200', // Angular dev
    'http://localhost:3000', // Otro posible puerto
    /^https?:\/\/localhost(:\d+)?$/, // Cualquier localhost con puerto
  ];

  return {
    port: configService.get<number>('PORT', 3000),
    apiPrefix: configService.get<string>('API_PREFIX', 'api/v1'),
    nodeEnv: configService.get<string>('NODE_ENV', 'development'),
    corsOrigin,
    cookieSecret: configService.get<string>('COOKIE_SECRET'),
  };
};

export interface AppConfig {
  port: number;
  apiPrefix: string;
  nodeEnv: string;
  corsOrigin: (string | RegExp)[];
  cookieSecret: string;
}
