import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

export const getJwtConfig = (configService: ConfigService) => {
  const logger = new Logger('JwtConfig');

  const secret = configService.get<string>('JWT_SECRET');
  const expiresIn = configService.get<string>('JWT_EXPIRES_IN', '86400');
  const refreshSecret = configService.get<string>('JWT_REFRESH_SECRET');
  const refreshExpiresIn = configService.get<string>('JWT_REFRESH_EXPIRES_IN', '604800');

  // Convertir a número para asegurar que son segundos
  const expiresInSeconds = parseInt(expiresIn, 10);
  const refreshExpiresInSeconds = parseInt(refreshExpiresIn, 10);

  // Debug logging
  logger.log(`🔑 JWT Configuration:`);
  logger.log(`Access Token Expires In: ${expiresInSeconds} seconds (${expiresInSeconds / 3600} hours)`);
  logger.log(`Refresh Token Expires In: ${refreshExpiresInSeconds} seconds (${refreshExpiresInSeconds / 86400} days)`);

  // Validaciones
  if (!secret) {
    throw new Error('JWT_SECRET is required');
  }

  if (!refreshSecret) {
    throw new Error('JWT_REFRESH_SECRET is required');
  }

  if (isNaN(expiresInSeconds) || expiresInSeconds <= 0) {
    throw new Error(`Invalid JWT_EXPIRES_IN: ${expiresIn}. Must be a positive number in seconds.`);
  }

  if (isNaN(refreshExpiresInSeconds) || refreshExpiresInSeconds <= 0) {
    throw new Error(`Invalid JWT_REFRESH_EXPIRES_IN: ${refreshExpiresIn}. Must be a positive number in seconds.`);
  }

  return {
    secret,
    expiresIn: expiresInSeconds,
    refreshSecret,
    refreshExpiresIn: refreshExpiresInSeconds,
  };
};

export interface JwtConfig {
  secret: string;
  expiresIn: number;
  refreshSecret: string;
  refreshExpiresIn: number;
}
