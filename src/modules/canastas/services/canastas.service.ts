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
          const exists = await this.canastasRepository.findByCodigoQr(codigoQr);
          if (exists) {
            throw new Error('Código QR duplicado');
          }

          // Crear la canasta
          await this.canastasRepository.create({ codigoQr });

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