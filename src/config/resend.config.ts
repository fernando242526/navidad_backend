import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

export const getResendConfig = (configService: ConfigService) => {
  const logger = new Logger('ResendConfig');

  const apiKey = configService.get<string>('RESEND_API_KEY');
  const fromEmail = configService.get<string>('RESEND_FROM_EMAIL', 'no-reply@cavalier.edu.pe');
  const fromName = configService.get<string>('RESEND_FROM_NAME', 'CAVALIER - Libro de Reclamaciones');

  // Validaciones
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is required');
  }

  logger.log('🔧 Resend Configuration:');
  logger.log(`From Email: ${fromEmail}`);
  logger.log(`From Name: ${fromName}`);
  logger.log(`API Key: ${apiKey.substring(0, 12)}...`);

  return {
    apiKey,
    fromEmail,
    fromName,
  };
};

export interface ResendConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
}
