import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Configuración de base de datos que soporta tanto conexión por URL (producción)
 * como por parámetros individuales (desarrollo) con soporte SSL completo
 */
export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const logger = new Logger('DatabaseConfig');
  const isProduction = configService.get<string>('NODE_ENV') === 'production';
  const databaseUrl = configService.get<string>('DATABASE_URL');

  // Configuración SSL
  const useSSL = configService.get<string>('DATABASE_SSL') === 'true';

  let sslConfig: Partial<TypeOrmModuleOptions> = {};

  if (useSSL) {
    logger.log('🔒 SSL enabled for database connection');

    const sslCertPath = path.resolve(process.cwd(), 'src/config/ssl/ca-certificate.crt');

    try {
      if (fs.existsSync(sslCertPath)) {
        const ca = fs.readFileSync(sslCertPath, 'utf8');
        logger.log('📜 Loading SSL certificate from: src/config/ssl/ca-certificate.crt');

        sslConfig = {
          ssl: {
            rejectUnauthorized: false,
            ca: ca,
            checkServerIdentity: () => undefined,
          },
          extra: {
            ssl: {
              rejectUnauthorized: false,
              ca: ca,
              checkServerIdentity: () => undefined,
            },
          },
        };
      } else {
        logger.warn('⚠️  SSL certificate not found, using basic SSL configuration for Digital Ocean');

        sslConfig = {
          ssl: {
            rejectUnauthorized: false,
            checkServerIdentity: () => undefined,
          },
          extra: {
            ssl: {
              rejectUnauthorized: false,
              checkServerIdentity: () => undefined,
            },
          },
        };
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`❌ Error loading SSL certificate: ${error.message}`);
      } else {
        logger.error(`❌ Error loading SSL certificate: ${String(error)}`);
      }

      logger.warn('📋 Using basic SSL configuration as fallback');

      sslConfig = {
        ssl: {
          rejectUnauthorized: false,
          checkServerIdentity: () => undefined,
        },
        extra: {
          ssl: {
            rejectUnauthorized: false,
            checkServerIdentity: () => undefined,
          },
        },
      };
    }
  } else {
    logger.log('🚫 SSL disabled for database connection');
    sslConfig = {
      ssl: false,
      extra: {},
    };
  }

  // Configuración base común
  const baseConfig: Partial<TypeOrmModuleOptions> = {
    type: 'postgres',
    schema: 'public', // 🔥 AGREGAR ESTA LÍNEA
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    synchronize: !isProduction,
    logging: !isProduction,
    autoLoadEntities: true,
    ...sslConfig,
  };

  // Si tenemos DATABASE_URL (típicamente en producción), la usamos
  if (databaseUrl) {
    logger.log('🔗 Using DATABASE_URL connection');

    return {
      ...baseConfig,
      url: databaseUrl,
    } as TypeOrmModuleOptions;
  }

  // Si no hay DATABASE_URL, usar configuración individual (desarrollo)
  logger.log('🏠 Using individual database parameters');

  const host = configService.get<string>('DATABASE_HOST');
  const port = configService.get<number>('DATABASE_PORT');
  const username = configService.get<string>('DATABASE_USERNAME');
  const password = configService.get<string>('DATABASE_PASSWORD');
  const database = configService.get<string>('DATABASE_NAME');

  if (!host || !port || !username || !password || !database) {
    throw new Error(`
      ❌ Database configuration incomplete for individual parameters mode.
      Required variables: DATABASE_HOST, DATABASE_PORT, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME
      
      For production, you can use DATABASE_URL instead.
      Current environment: ${configService.get<string>('NODE_ENV', 'development')}
    `);
  }

  return {
    ...baseConfig,
    host,
    port,
    username,
    password,
    database,
  } as TypeOrmModuleOptions;
};
