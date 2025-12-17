import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trabajador } from './entities/trabajador.entity';
import { TrabajadoresController } from './controllers/trabajadores.controller';
import { TrabajadoresService } from './services/trabajadores.service';
import { TrabajadoresRepository } from './repositories/trabajadores.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Trabajador])],
  controllers: [TrabajadoresController],
  providers: [TrabajadoresService, TrabajadoresRepository],
  exports: [TrabajadoresService, TrabajadoresRepository],
})
export class TrabajadoresModule {}