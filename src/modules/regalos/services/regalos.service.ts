import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { RegalosRepository } from '../repositories/regalos.repository';
import { CreateRegaloDto } from '../dto/create-regalo.dto';
import { UpdateRegaloDto } from '../dto/update-regalo.dto';
import { RegaloResponseDto } from '../dto/regalo-response.dto';
import { APP_CONSTANTS } from '../../../common/constants/app.constants';

@Injectable()
export class RegalosService {
  constructor(
    private readonly regalosRepository: RegalosRepository,
  ) {}

  async create(createRegaloDto: CreateRegaloDto): Promise<RegaloResponseDto> {
    // Verificar si el regalo ya existe
    const existingRegalo = await this.regalosRepository.findByCodigoQr(createRegaloDto.codigoQr);
    if (existingRegalo) {
      throw new ConflictException('Regalo con este código QR ya existe');
    }

    // Crear el regalo
    const regalo = await this.regalosRepository.create(createRegaloDto);

    return new RegaloResponseDto(regalo);
  }

  async findAll(
    page: number = APP_CONSTANTS.PAGINATION.DEFAULT_PAGE,
    limit: number = APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT,
    search?: string,
  ): Promise<{ regalos: RegaloResponseDto[]; total: number }> {
    const validatedPage = page && page > 0 ? page : APP_CONSTANTS.PAGINATION.DEFAULT_PAGE;
    const validatedLimit = limit && limit > 0 ? Math.min(limit, APP_CONSTANTS.PAGINATION.MAX_LIMIT) : APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT;

    if (search && search.trim() === '') {
      throw new BadRequestException('Search filter cannot be empty');
    }

    const { regalos, total } = await this.regalosRepository.findAll(
      validatedPage,
      validatedLimit,
      search,
    );

    const regaloResponseDtos = regalos.map(regalo => new RegaloResponseDto(regalo));

    return { regalos: regaloResponseDtos, total };
  }

  async findOne(id: string): Promise<RegaloResponseDto> {
    if (!id) {
      throw new BadRequestException('Regalo ID is required');
    }

    const regalo = await this.regalosRepository.findOne(id);
    if (!regalo) {
      throw new NotFoundException('Regalo not found');
    }

    return new RegaloResponseDto(regalo);
  }

  async findByCodigoQr(codigoQr: string): Promise<RegaloResponseDto> {
    if (!codigoQr) {
      throw new BadRequestException('Código QR is required');
    }

    const regalo = await this.regalosRepository.findByCodigoQr(codigoQr);
    if (!regalo) {
      throw new NotFoundException('Regalo not found');
    }

    return new RegaloResponseDto(regalo);
  }

  async update(id: string, updateRegaloDto: UpdateRegaloDto): Promise<RegaloResponseDto> {
    if (!id) {
      throw new BadRequestException('Regalo ID is required');
    }

    const existingRegalo = await this.regalosRepository.findOne(id);
    if (!existingRegalo) {
      throw new NotFoundException('Regalo not found');
    }

    // Si se actualiza el código QR, verificar que no esté en uso
    if (updateRegaloDto.codigoQr && updateRegaloDto.codigoQr !== existingRegalo.codigoQr) {
      const codigoQrExists = await this.regalosRepository.findByCodigoQr(updateRegaloDto.codigoQr);
      if (codigoQrExists) {
        throw new ConflictException('Código QR already in use');
      }
    }

    const updatedRegalo = await this.regalosRepository.update(id, updateRegaloDto);
    if (!updatedRegalo) {
      throw new NotFoundException('Regalo not found');
    }

    return new RegaloResponseDto(updatedRegalo);
  }

  async remove(id: string): Promise<void> {
    if (!id) {
      throw new BadRequestException('Regalo ID is required');
    }

    const regalo = await this.regalosRepository.findOne(id);
    if (!regalo) {
      throw new NotFoundException('Regalo not found');
    }

    await this.regalosRepository.remove(id);
  }
}