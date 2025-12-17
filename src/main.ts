import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { getAppConfig } from './config/app.config';
import { setupSwagger } from './config/swagger.config';
import { DatabaseSeedService } from './database/seeds/database-seed.service';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create(AppModule);

    const configService = app.get(ConfigService);
    const appConfig = getAppConfig(configService);

    // Global prefix
    app.setGlobalPrefix(appConfig.apiPrefix);

    // CORS
    app.enableCors({
      origin: appConfig.corsOrigin,
      credentials: true,
      allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'Cache-Control'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      optionsSuccessStatus: 200,
    });
    // Cookie parser
    app.use(cookieParser(appConfig.cookieSecret));

    // Swagger documentation
    if (appConfig.nodeEnv !== 'production') {
      setupSwagger(app);
    }

    // 🌱 Ejecutar seeds automáticamente
    logger.log('🌱 Running database seeds...');
    const seedService = app.get(DatabaseSeedService);

    await seedService.runSeeds();
    await app.listen(appConfig.port);
    logger.log(`🚀 Application is running on: http://localhost:${appConfig.port}/${appConfig.apiPrefix}`);
    if (appConfig.nodeEnv !== 'production') {
      logger.log(`📚 Swagger documentation: http://localhost:${appConfig.port}/api/docs`);
    }

    logger.log('🏢 El Pedregal - Sistema ERP Backend');
    logger.log('🎯 Default Admin Credentials:');
    logger.log('📧 Email: admin@elpedregal.com');
    logger.log('🔑 Password: Admin123!');
    logger.log('⚠️  Change password after first login!');
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`❌ Failed to start application: ${error.message}`);
    } else {
      logger.error(`❌ Failed to start application: ${String(error)}`);
    }
    process.exit(1);
  }
}
bootstrap();
