import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { CanastasRepository } from '../repositories/canastas.repository';
import { CreateCanastaDto } from '../dto/create-canasta.dto';
import { UpdateCanastaDto } from '../dto/update-canasta.dto';
import { CanastaResponseDto } from '../dto/canasta-response.dto';
import { APP_CONSTANTS } from '../../../common/constants/app.constants';

@Injectable()
export class CanastasService {
  constructor(
    private readonly canastasRepository: CanastasRepository,
  ) {}

  async create(createCanastaDto: CreateCanastaDto): Promise<CanastaResponseDto> {
    // Verificar si la canasta ya existe
    const existingCanasta = await this.canastasRepository.findByCodigoQr(createCanastaDto.codigoQr);
    if (existingCanasta) {
      throw new ConflictException('Canasta con este código QR ya existe');
    }

    // Crear la canasta
    const canasta = await this.canastasRepository.create(createCanastaDto);

    return new CanastaResponseDto(canasta);
  }

  async findAll(
    page: number = APP_CONSTANTS.PAGINATION.DEFAULT_PAGE,
    limit: number = APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT,
    search?: string,
  ): Promise<{ canastas: CanastaResponseDto[]; total: number }> {
    const validatedPage = page && page > 0 ? page : APP_CONSTANTS.PAGINATION.DEFAULT_PAGE;
    const validatedLimit = limit && limit > 0 ? Math.min(limit, APP_CONSTANTS.PAGINATION.MAX_LIMIT) : APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT;

    if (search && search.trim() === '') {
      throw new BadRequestException('Search filter cannot be empty');
    }

    const { canastas, total } = await this.canastasRepository.findAll(
      validatedPage,
      validatedLimit,
      search,
    );

    const canastaResponseDtos = canastas.map(canasta => new CanastaResponseDto(canasta));

    return { canastas: canastaResponseDtos, total };
  }

  async findOne(id: string): Promise<CanastaResponseDto> {
    if (!id) {
      throw new BadRequestException('Canasta ID is required');
    }

    const canasta = await this.canastasRepository.findOne(id);
    if (!canasta) {
      throw new NotFoundException('Canasta not found');
    }

    return new CanastaResponseDto(canasta);
  }

  async findByCodigoQr(codigoQr: string): Promise<CanastaResponseDto> {
    if (!codigoQr) {
      throw new BadRequestException('Código QR is required');
    }

    const canasta = await this.canastasRepository.findByCodigoQr(codigoQr);
    if (!canasta) {
      throw new NotFoundException('Canasta not found');
    }

    return new CanastaResponseDto(canasta);
  }

  async update(id: string, updateCanastaDto: UpdateCanastaDto): Promise<CanastaResponseDto> {
    if (!id) {
      throw new BadRequestException('Canasta ID is required');
    }

    const existingCanasta = await this.canastasRepository.findOne(id);
    if (!existingCanasta) {
      throw new NotFoundException('Canasta not found');
    }

    // Si se actualiza el código QR, verificar que no esté en uso
    if (updateCanastaDto.codigoQr && updateCanastaDto.codigoQr !== existingCanasta.codigoQr) {
      const codigoQrExists = await this.canastasRepository.findByCodigoQr(updateCanastaDto.codigoQr);
      if (codigoQrExists) {
        throw new ConflictException('Código QR already in use');
      }
    }

    const updatedCanasta = await this.canastasRepository.update(id, updateCanastaDto);
    if (!updatedCanasta) {
      throw new NotFoundException('Canasta not found');
    }

    return new CanastaResponseDto(updatedCanasta);
  }

  async remove(id: string): Promise<void> {
    if (!id) {
      throw new BadRequestException('Canasta ID is required');
    }

    const canasta = await this.canastasRepository.findOne(id);
    if (!canasta) {
      throw new NotFoundException('Canasta not found');
    }

    await this.canastasRepository.remove(id);
  }
}