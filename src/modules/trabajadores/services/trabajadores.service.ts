import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { TrabajadoresRepository } from '../repositories/trabajadores.repository';
import { CreateTrabajadorDto } from '../dto/create-trabajador.dto';
import { UpdateTrabajadorDto } from '../dto/update-trabajador.dto';
import { TrabajadorResponseDto } from '../dto/trabajador-response.dto';
import { EstadoCanasta, EstadoRegalos, AuditorioCanasta } from '../entities/trabajador.entity';
import { APP_CONSTANTS } from '../../../common/constants/app.constants';

@Injectable()
export class TrabajadoresService {
  constructor(
    private readonly trabajadoresRepository: TrabajadoresRepository,
  ) {}

  async create(createTrabajadorDto: CreateTrabajadorDto): Promise<TrabajadorResponseDto> {
    // Verificar si el trabajador ya existe
    const existingTrabajador = await this.trabajadoresRepository.findByDni(createTrabajadorDto.dni);
    if (existingTrabajador) {
      throw new ConflictException('Trabajador con este DNI ya existe');
    }

    // Crear el trabajador
    const trabajador = await this.trabajadoresRepository.create({
      ...createTrabajadorDto,
      fechaIngreso: new Date(createTrabajadorDto.fechaIngreso),
    });

    return new TrabajadorResponseDto(trabajador);
  }

  async findAll(
    page: number = APP_CONSTANTS.PAGINATION.DEFAULT_PAGE,
    limit: number = APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT,
    estadoCanasta?: EstadoCanasta,
    estadoRegalos?: EstadoRegalos,
    auditorioCanasta?: AuditorioCanasta,
    search?: string,
  ): Promise<{ trabajadores: TrabajadorResponseDto[]; total: number }> {
    const validatedPage = page && page > 0 ? page : APP_CONSTANTS.PAGINATION.DEFAULT_PAGE;
    const validatedLimit = limit && limit > 0 ? Math.min(limit, APP_CONSTANTS.PAGINATION.MAX_LIMIT) : APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT;

    if (search && search.trim() === '') {
      throw new BadRequestException('Search filter cannot be empty');
    }

    const { trabajadores, total } = await this.trabajadoresRepository.findAll(
      validatedPage,
      validatedLimit,
      estadoCanasta,
      estadoRegalos,
      auditorioCanasta,
      search,
    );

    const trabajadorResponseDtos = trabajadores.map(trabajador => new TrabajadorResponseDto(trabajador));

    return { trabajadores: trabajadorResponseDtos, total };
  }

  async findOne(id: string): Promise<TrabajadorResponseDto> {
    if (!id) {
      throw new BadRequestException('Trabajador ID is required');
    }

    const trabajador = await this.trabajadoresRepository.findOne(id);
    if (!trabajador) {
      throw new NotFoundException('Trabajador not found');
    }

    return new TrabajadorResponseDto(trabajador);
  }

  async findByDni(dni: string): Promise<TrabajadorResponseDto> {
    if (!dni) {
      throw new BadRequestException('DNI is required');
    }

    const trabajador = await this.trabajadoresRepository.findByDni(dni);
    if (!trabajador) {
      throw new NotFoundException('Trabajador not found');
    }

    return new TrabajadorResponseDto(trabajador);
  }

  async update(id: string, updateTrabajadorDto: UpdateTrabajadorDto): Promise<TrabajadorResponseDto> {
    if (!id) {
      throw new BadRequestException('Trabajador ID is required');
    }

    const existingTrabajador = await this.trabajadoresRepository.findOne(id);
    if (!existingTrabajador) {
      throw new NotFoundException('Trabajador not found');
    }

    // Si se actualiza el DNI, verificar que no esté en uso
    if (updateTrabajadorDto.dni && updateTrabajadorDto.dni !== existingTrabajador.dni) {
      const dniExists = await this.trabajadoresRepository.findByDni(updateTrabajadorDto.dni);
      if (dniExists) {
        throw new ConflictException('DNI already in use');
      }
    }

    const updateData: Partial<any> = { ...updateTrabajadorDto };
    if (updateTrabajadorDto.fechaIngreso) {
      updateData.fechaIngreso = new Date(updateTrabajadorDto.fechaIngreso);
    }

    const updatedTrabajador = await this.trabajadoresRepository.update(id, updateData);
    if (!updatedTrabajador) {
      throw new NotFoundException('Trabajador not found');
    }

    return new TrabajadorResponseDto(updatedTrabajador);
  }

  async remove(id: string): Promise<void> {
    if (!id) {
      throw new BadRequestException('Trabajador ID is required');
    }

    const trabajador = await this.trabajadoresRepository.findOne(id);
    if (!trabajador) {
      throw new NotFoundException('Trabajador not found');
    }

    await this.trabajadoresRepository.remove(id);
  }
}