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

  async importFromExcel(file: Express.Multer.File): Promise<{ 
    success: number; 
    failed: number; 
    errors: Array<{ row: number; codigoQr: string; error: string }> 
  }> {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    // Importar xlsx dinámicamente
    const XLSX = await import('xlsx');
    
    let workbook: any;
    try {
      workbook = XLSX.read(file.buffer, { type: 'buffer' });
    } catch (error) {
      throw new BadRequestException('El archivo no es un Excel válido');
    }

    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new BadRequestException('El archivo Excel está vacío');
    }

    const worksheet = workbook.Sheets[sheetName];
    const rawData: any[] = XLSX.utils.sheet_to_json(worksheet);

    if (rawData.length === 0) {
      throw new BadRequestException('El archivo no contiene datos');
    }

    let successCount = 0;
    let failedCount = 0;
    const errors: Array<{ row: number; codigoQr: string; error: string }> = [];

    // Procesar en lotes de 500
    const BATCH_SIZE = 500;
    
    for (let i = 0; i < rawData.length; i += BATCH_SIZE) {
      const batch = rawData.slice(i, i + BATCH_SIZE);
      
      for (let j = 0; j < batch.length; j++) {
        const rowIndex = i + j + 2; // +2 porque Excel empieza en 1 y tiene header
        const row = batch[j];

        try {
          // Obtener código QR (soporta diferentes formatos de columna)
          const codigoQr = String(
            row['CODIGO_QR'] || 
            row['Codigo QR'] || 
            row['codigoQr'] || 
            ''
          ).trim();

          // Validar datos básicos
          if (!codigoQr || codigoQr.length === 0) {
            throw new Error('Código QR vacío o inválido');
          }

          // Verificar si ya existe
          const exists = await this.regalosRepository.findByCodigoQr(codigoQr);
          if (exists) {
            throw new Error('Código QR duplicado');
          }

          // Crear el regalo
          await this.regalosRepository.create({ codigoQr });

          successCount++;
        } catch (error: any) {
          failedCount++;
          errors.push({
            row: rowIndex,
            codigoQr: String(
              row['CODIGO_QR'] || 
              row['Codigo QR'] || 
              row['codigoQr'] || 
              'N/A'
            ),
            error: error.message || 'Error desconocido',
          });
        }
      }
    }

    return { success: successCount, failed: failedCount, errors };
  }
}