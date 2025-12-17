import { Module } from '@nestjs/common';
import { FlujoController } from './controllers/flujo.controller';
import { FlujoService } from './services/flujo.service';
import { TrabajadoresModule } from '../trabajadores/trabajadores.module';
import { CanastasModule } from '../canastas/canastas.module';
import { RegalosModule } from '../regalos/regalos.module';
import { TrabajadorRegalosModule } from '../trabajador-regalos/trabajador-regalos.module';
import { LogsModule } from '../logs/logs.module';

@Module({
  imports: [
    TrabajadoresModule,
    CanastasModule,
    RegalosModule,
    TrabajadorRegalosModule,
    LogsModule,
  ],
  controllers: [FlujoController],
  providers: [FlujoService],
  exports: [FlujoService],
})
export class FlujoModule {}