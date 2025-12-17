import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrabajadorRegalo } from './entities/trabajador-regalo.entity';
import { TrabajadorRegalosController } from './controllers/trabajador-regalos.controller';
import { TrabajadorRegalosService } from './services/trabajador-regalos.service';
import { TrabajadorRegalosRepository } from './repositories/trabajador-regalos.repository';
import { TrabajadoresModule } from '../trabajadores/trabajadores.module';
import { RegalosModule } from '../regalos/regalos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TrabajadorRegalo]),
    TrabajadoresModule,
    RegalosModule,
  ],
  controllers: [TrabajadorRegalosController],
  providers: [TrabajadorRegalosService, TrabajadorRegalosRepository],
  exports: [TrabajadorRegalosService, TrabajadorRegalosRepository],
})
export class TrabajadorRegalosModule {}