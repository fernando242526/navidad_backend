import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { TrabajadorRegalosRepository } from '../repositories/trabajador-regalos.repository';
import { CreateTrabajadorRegaloDto } from '../dto/create-trabajador-regalo.dto';
import { TrabajadorRegaloResponseDto } from '../dto/trabajador-regalo-response.dto';
import { APP_CONSTANTS } from '../../../common/constants/app.constants';
import { TrabajadoresRepository } from '../../trabajadores/repositories/trabajadores.repository';
import { RegalosRepository } from '../../regalos/repositories/regalos.repository';
import { TrabajadorResponseDto } from '../../trabajadores/dto/trabajador-response.dto';
import { RegaloResponseDto } from '../../regalos/dto/regalo-response.dto';

@Injectable()
export class TrabajadorRegalosService {
  constructor(
    private readonly trabajadorRegalosRepository: TrabajadorRegalosRepository,
    private readonly trabajadoresRepository: TrabajadoresRepository,
    private readonly regalosRepository: RegalosRepository,
  ) {}

  async create(createTrabajadorRegaloDto: CreateTrabajadorRegaloDto): Promise<TrabajadorRegaloResponseDto[]> {
    const { idTrabajador, regalos } = createTrabajadorRegaloDto;

    // Verificar que el trabajador existe
    const trabajador = await this.trabajadoresRepository.findOne(idTrabajador);
    if (!trabajador) {
      throw new NotFoundException('Trabajador not found');
    }

    // Verificar que todos los regalos existen
    const regalosEntities = await this.regalosRepository.findByIds(regalos);
    if (regalosEntities.length !== regalos.length) {
      throw new BadRequestException('One or more regalos not found');
    }

    // Crear múltiples registros en la tabla intermedia
    const createDataArray = regalos.map(idRegalo => ({
      idTrabajador,
      idRegalo,
    }));

    const trabajadorRegalos = await this.trabajadorRegalosRepository.createMany(createDataArray);

    return trabajadorRegalos.map(tr => new TrabajadorRegaloResponseDto({
      ...tr,
      trabajador: new TrabajadorResponseDto(trabajador),
      regalo: new RegaloResponseDto(regalosEntities.find(r => r.id === tr.idRegalo)!),
    }));
  }

  async findAll(
    page: number = APP_CONSTANTS.PAGINATION.DEFAULT_PAGE,
    limit: number = APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT,
    idTrabajador?: string,
    idRegalo?: string,
  ): Promise<{ trabajadorRegalos: TrabajadorRegaloResponseDto[]; total: number }> {
    const validatedPage = page && page > 0 ? page : APP_CONSTANTS.PAGINATION.DEFAULT_PAGE;
    const validatedLimit = limit && limit > 0 ? Math.min(limit, APP_CONSTANTS.PAGINATION.MAX_LIMIT) : APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT;

    const { trabajadorRegalos, total } = await this.trabajadorRegalosRepository.findAll(
      validatedPage,
      validatedLimit,
      idTrabajador,
      idRegalo,
    );

    const trabajadorRegaloResponseDtos = trabajadorRegalos.map(tr => {
      const dto = new TrabajadorRegaloResponseDto(tr);
      if (tr.trabajador) {
        dto.trabajador = new TrabajadorResponseDto(tr.trabajador);
      }
      if (tr.regalo) {
        dto.regalo = new RegaloResponseDto(tr.regalo);
      }
      return dto;
    });

    return { trabajadorRegalos: trabajadorRegaloResponseDtos, total };
  }

  async findOne(id: string): Promise<TrabajadorRegaloResponseDto> {
    if (!id) {
      throw new BadRequestException('TrabajadorRegalo ID is required');
    }

    const trabajadorRegalo = await this.trabajadorRegalosRepository.findOne(id);
    if (!trabajadorRegalo) {
      throw new NotFoundException('TrabajadorRegalo not found');
    }

    const dto = new TrabajadorRegaloResponseDto(trabajadorRegalo);
    if (trabajadorRegalo.trabajador) {
      dto.trabajador = new TrabajadorResponseDto(trabajadorRegalo.trabajador);
    }
    if (trabajadorRegalo.regalo) {
      dto.regalo = new RegaloResponseDto(trabajadorRegalo.regalo);
    }

    return dto;
  }

  async findByTrabajadorId(idTrabajador: string): Promise<TrabajadorRegaloResponseDto[]> {
    if (!idTrabajador) {
      throw new BadRequestException('Trabajador ID is required');
    }

    const trabajadorRegalos = await this.trabajadorRegalosRepository.findByTrabajadorId(idTrabajador);

    return trabajadorRegalos.map(tr => {
      const dto = new TrabajadorRegaloResponseDto(tr);
      if (tr.regalo) {
        dto.regalo = new RegaloResponseDto(tr.regalo);
      }
      return dto;
    });
  }

  async remove(id: string): Promise<void> {
    if (!id) {
      throw new BadRequestException('TrabajadorRegalo ID is required');
    }

    const trabajadorRegalo = await this.trabajadorRegalosRepository.findOne(id);
    if (!trabajadorRegalo) {
      throw new NotFoundException('TrabajadorRegalo not found');
    }

    await this.trabajadorRegalosRepository.remove(id);
  }

  async removeByTrabajadorId(idTrabajador: string): Promise<void> {
    if (!idTrabajador) {
      throw new BadRequestException('Trabajador ID is required');
    }

    await this.trabajadorRegalosRepository.removeByTrabajadorId(idTrabajador);
  }
}