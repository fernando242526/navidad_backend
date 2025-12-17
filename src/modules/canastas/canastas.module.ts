import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Canasta } from './entities/canasta.entity';
import { CanastasController } from './controllers/canastas.controller';
import { CanastasService } from './services/canastas.service';
import { CanastasRepository } from './repositories/canastas.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Canasta])],
  controllers: [CanastasController],
  providers: [CanastasService, CanastasRepository],
  exports: [CanastasService, CanastasRepository],
})
export class CanastasModule {}