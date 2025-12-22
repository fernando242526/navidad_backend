import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { CanastasService } from '../services/canastas.service';
import { CreateCanastaDto } from '../dto/create-canasta.dto';
import { UpdateCanastaDto } from '../dto/update-canasta.dto';
import { CanastaResponseDto } from '../dto/canasta-response.dto';
import { CanastaFilterDto } from '../dto/canasta-filter.dto';
import { BaseResponseDto, PaginatedResponseDto } from '../../../common/dto/base-response.dto';
import { JwtAuthGuard } from '../../../common/guards/auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/constants/roles.enum';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Canastas')
@Controller('canastas')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CanastasController {
  constructor(private readonly canastasService: CanastasService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear nueva canasta (Solo Admin)' })
  @ApiResponse({ status: 201, description: 'Canasta creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Canasta ya existe' })
  async create(
    @Body() createCanastaDto: CreateCanastaDto,
  ): Promise<BaseResponseDto<CanastaResponseDto>> {
    const canasta = await this.canastasService.create(createCanastaDto);
    return new BaseResponseDto(canasta, 'Canasta creada exitosamente', HttpStatus.CREATED);
  }

  @Post('import')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Importar canastas desde Excel (Solo Admin)' })
  @ApiResponse({ status: 200, description: 'Importación completada' })
  @ApiResponse({ status: 400, description: 'Archivo inválido' })
  async importExcel(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<BaseResponseDto<{ 
    success: number; 
    failed: number; 
    errors: Array<{ row: number; codigoQr: string; error: string }> 
  }>> {
    const result = await this.canastasService.importFromExcel(file);
    return new BaseResponseDto(
      result,
      `Importación completada: ${result.success} exitosos, ${result.failed} fallidos`,
    );
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.LIDER_PROCESO)
  @ApiOperation({ summary: 'Obtener todas las canastas con paginación y filtros' })
  @ApiResponse({ status: 200, description: 'Canastas obtenidas exitosamente' })
  async findAll(
    @Query() filterDto: CanastaFilterDto,
  ): Promise<PaginatedResponseDto<CanastaResponseDto>> {
    const page = filterDto.page ?? 1;
    const limit = filterDto.limit ?? 10;

    const { canastas, total } = await this.canastasService.findAll(
      page,
      limit,
      filterDto.search,
    );

    return new PaginatedResponseDto(
      canastas,
      total,
      page,
      limit,
      'Canastas obtenidas exitosamente',
    );
  }

  @Get('codigo-qr/:codigoQr')
  @Roles(UserRole.ADMIN, UserRole.LIDER_PROCESO, UserRole.ENCARGADO_ENTREGA_CANASTA)
  @ApiOperation({ summary: 'Obtener canasta por código QR' })
  @ApiResponse({ status: 200, description: 'Canasta encontrada' })
  @ApiResponse({ status: 404, description: 'Canasta no encontrada' })
  async findByCodigoQr(@Param('codigoQr') codigoQr: string): Promise<BaseResponseDto<CanastaResponseDto>> {
    const canasta = await this.canastasService.findByCodigoQr(codigoQr);
    return new BaseResponseDto(canasta, 'Canasta encontrada');
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.LIDER_PROCESO)
  @ApiOperation({ summary: 'Obtener canasta por ID' })
  @ApiResponse({ status: 200, description: 'Canasta encontrada' })
  @ApiResponse({ status: 404, description: 'Canasta no encontrada' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BaseResponseDto<CanastaResponseDto>> {
    const canasta = await this.canastasService.findOne(id);
    return new BaseResponseDto(canasta, 'Canasta encontrada');
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar canasta por ID (Solo Admin)' })
  @ApiResponse({ status: 200, description: 'Canasta actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Canasta no encontrada' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCanastaDto: UpdateCanastaDto,
  ): Promise<BaseResponseDto<CanastaResponseDto>> {
    const canasta = await this.canastasService.update(id, updateCanastaDto);
    return new BaseResponseDto(canasta, 'Canasta actualizada exitosamente');
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar canasta por ID (Solo Admin)' })
  @ApiResponse({ status: 204, description: 'Canasta eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Canasta no encontrada' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.canastasService.remove(id);
  }
}