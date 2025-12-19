import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { TrabajadoresRepository } from '../repositories/trabajadores.repository';
import { CreateTrabajadorDto } from '../dto/create-trabajador.dto';
import { UpdateTrabajadorDto } from '../dto/update-trabajador.dto';
import { TrabajadorResponseDto } from '../dto/trabajador-response.dto';
import { EstadoCanasta, EstadoRegalos, AuditorioCanasta, AuditorioJuguetes } from '../entities/trabajador.entity';
import { APP_CONSTANTS } from '../../../common/constants/app.constants';
import { ImportTrabajadorRowDto } from '../dto/import-trabajadores.dto';

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

  async importFromExcel(file: Express.Multer.File): Promise<{ 
    success: number; 
    failed: number; 
    errors: Array<{ row: number; dni: string; error: string }> 
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
    const errors: Array<{ row: number; dni: string; error: string }> = [];

    // Procesar en lotes de 500
    const BATCH_SIZE = 500;
    
    for (let i = 0; i < rawData.length; i += BATCH_SIZE) {
      const batch = rawData.slice(i, i + BATCH_SIZE);
      
      for (let j = 0; j < batch.length; j++) {
        const rowIndex = i + j + 2; // +2 porque Excel empieza en 1 y tiene header
        const row = batch[j];

        try {
          // Mapear columnas del Excel a DTO
          const trabajadorData: Partial<ImportTrabajadorRowDto> = {
            dni: String(row['DNI'] || row['dni'] || '').trim(),
            correlativo: String(row['CORRELATIVO'] || row['correlativo'] || '').trim(),
            nombresCompletos: String(row['NOMBRES_COMPLETOS'] || row['Nombres Completos'] || row['nombresCompletos'] || '').trim(),
            fechaIngreso: this.parseExcelDate(row['FECHA_INGRESO'] || row['Fecha Ingreso'] || row['fechaIngreso']),
            funcion: String(row['FUNCION'] || row['Funcion'] || row['funcion'] || '').trim(),
            tipoCanasta: String(row['TIPO_CANASTA'] || row['Tipo Canasta'] || row['tipoCanasta'] || '').trim(),
            auditorioCanasta: this.parseAuditorioCanasta(row['AUDITORIO_CANASTA'] || row['Auditorio Canasta'] || row['auditorioCanasta']),
            auditorioJuguetes: this.parseAuditorioJuguetes(row['AUDITORIO_JUGUETES'] || row['Auditorio Juguetes'] || row['auditorioJuguetes']),
          };

          // Validar datos básicos
          if (!trabajadorData.dni || trabajadorData.dni.length < 8) {
            throw new Error('DNI inválido o vacío');
          }

          if (!trabajadorData.nombresCompletos) {
            throw new Error('Nombres completos requeridos');
          }

          if (!trabajadorData.fechaIngreso) {
            throw new Error('Fecha de ingreso inválida');
          }

          // Verificar si ya existe
          const exists = await this.trabajadoresRepository.findByDni(trabajadorData.dni);
          if (exists) {
            throw new Error('DNI duplicado');
          }

          // Crear el trabajador
          await this.trabajadoresRepository.create({
            ...trabajadorData,
            fechaIngreso: new Date(trabajadorData.fechaIngreso),
          } as any);

          successCount++;
        } catch (error: any) {
          failedCount++;
          errors.push({
            row: rowIndex,
            dni: String(row['DNI'] || row['dni'] || 'N/A'),
            error: error.message || 'Error desconocido',
          });
        }
      }
    }

    return { success: successCount, failed: failedCount, errors };
  }

  private parseExcelDate(value: any): string {
    if (!value) return '';
    
    // Si es un número (Excel serial date)
    if (typeof value === 'number') {
      const date = new Date((value - 25569) * 86400 * 1000);
      return date.toISOString().split('T')[0];
    }
    
    // Si es string, intentar parsearlo
    if (typeof value === 'string') {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0];
      }
    }
    
    return '';
  }

  private parseAuditorioCanasta(value: any): AuditorioCanasta {
    const str = String(value || '').trim().toUpperCase();
    
    if (str === 'AUDITORIO_2' || str === 'AUDITORIO 2' || str === '2') {
      return AuditorioCanasta.AUDITORIO_2;
    }
    if (str === 'AUDITORIO_3' || str === 'AUDITORIO 3' || str === '3') {
      return AuditorioCanasta.AUDITORIO_3;
    }
    
    throw new Error('Auditorio de canasta inválido (debe ser AUDITORIO_2 o AUDITORIO_3)');
  }

  private parseAuditorioJuguetes(value: any): AuditorioJuguetes | null {
    if (!value || value === '' || value === 'N/A' || value === 'null') {
      return null;
    }
    
    const str = String(value).trim().toUpperCase();
    
    if (str === 'AUDITORIO_1' || str === 'AUDITORIO 1' || str === '1') {
      return AuditorioJuguetes.AUDITORIO_1;
    }
    
    return null;
  } 

  /**
   * Exportar todos los trabajadores a Excel
   */
  async exportToExcel(): Promise<Buffer> {
    // Obtener TODOS los trabajadores sin paginación
    const { trabajadores } = await this.trabajadoresRepository.findAll(
      1, 
      999999, // Límite muy alto para obtener todos
    );

    if (trabajadores.length === 0) {
      throw new BadRequestException('No hay trabajadores para exportar');
    }

    // Importar xlsx dinámicamente
    const XLSX = await import('xlsx');

    // Preparar datos para Excel con encabezados en MAYÚSCULAS
    const excelData = trabajadores.map((trabajador) => ({
      'DNI': trabajador.dni,
      'NOMBRES_COMPLETOS': trabajador.nombresCompletos,
      'FECHA_INGRESO': trabajador.fechaIngreso 
        ? new Date(trabajador.fechaIngreso).toISOString().split('T')[0] 
        : '',
      'FUNCION': trabajador.funcion || '',
      'TIPO_CANASTA': trabajador.tipoCanasta || '',
      'ESTADO_CANASTA': trabajador.estadoCanasta,
      'ESTADO_REGALOS': trabajador.estadoRegalos,
      'AUDITORIO_CANASTA': trabajador.auditorioCanasta,
      'AUDITORIO_JUGUETES': trabajador.auditorioJuguetes || '',
      'FECHA_HORA_ENTREGA_CANASTA': trabajador.fechaHoraEntregaCanasta 
        ? new Date(trabajador.fechaHoraEntregaCanasta).toISOString() 
        : '',
      'FECHA_HORA_ENTREGA_JUGUETES': trabajador.fechaHoraEntregaJuguetes 
        ? new Date(trabajador.fechaHoraEntregaJuguetes).toISOString() 
        : '',
    }));

    // Crear workbook y worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Trabajadores');

    // Ajustar ancho de columnas
    const columnWidths = [
      { wch: 12 },  // DNI
      { wch: 35 },  // NOMBRES_COMPLETOS
      { wch: 15 },  // FECHA_INGRESO
      { wch: 25 },  // FUNCION
      { wch: 20 },  // TIPO_CANASTA
      { wch: 20 },  // ESTADO_CANASTA
      { wch: 20 },  // ESTADO_REGALOS
      { wch: 20 },  // AUDITORIO_CANASTA
      { wch: 20 },  // AUDITORIO_JUGUETES
      { wch: 25 },  // FECHA_HORA_ENTREGA_CANASTA
      { wch: 25 },  // FECHA_HORA_ENTREGA_JUGUETES
    ];
    worksheet['!cols'] = columnWidths;

    // Generar buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
  }
}