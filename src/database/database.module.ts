import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from '../config/database.config';
import { DatabaseSeedService } from './seeds/database-seed.service';
import { AdminSeedService } from './seeds/admin-seed.service';
import { UsersModule } from '../modules/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => getDatabaseConfig(configService),
    }),
    UsersModule, // Importamos UsersModule para usar UsersRepository en seeds
  ],
  providers: [DatabaseSeedService, AdminSeedService],
  exports: [DatabaseSeedService],
})
export class DatabaseModule {}
