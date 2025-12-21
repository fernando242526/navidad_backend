import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trabajador } from './entities/trabajador.entity';
import { TrabajadoresController } from './controllers/trabajadores.controller';
import { TrabajadoresService } from './services/trabajadores.service';
import { TrabajadoresRepository } from './repositories/trabajadores.repository';
import { LogsModule } from '../logs/logs.module';

@Module({
  imports: [TypeOrmModule.forFeature([Trabajador]), forwardRef(() => LogsModule),],
  controllers: [TrabajadoresController],
  providers: [TrabajadoresService, TrabajadoresRepository],
  exports: [TrabajadoresService, TrabajadoresRepository],
})
export class TrabajadoresModule {}