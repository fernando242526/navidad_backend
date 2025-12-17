import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Log } from './entities/log.entity';
import { LogsController } from './controllers/logs.controller';
import { LogsService } from './services/logs.service';
import { LogsRepository } from './repositories/logs.repository';
import { TrabajadoresModule } from '../trabajadores/trabajadores.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Log]),
    TrabajadoresModule,
    UsersModule,
  ],
  controllers: [LogsController],
  providers: [LogsService, LogsRepository],
  exports: [LogsService, LogsRepository],
})
export class LogsModule {}