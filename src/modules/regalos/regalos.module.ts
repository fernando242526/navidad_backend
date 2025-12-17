import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Regalo } from './entities/regalo.entity';
import { RegalosController } from './controllers/regalos.controller';
import { RegalosService } from './services/regalos.service';
import { RegalosRepository } from './repositories/regalos.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Regalo])],
  controllers: [RegalosController],
  providers: [RegalosService, RegalosRepository],
  exports: [RegalosService, RegalosRepository],
})
export class RegalosModule {}