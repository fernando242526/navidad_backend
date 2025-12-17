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
} from '@nestjs/common';
import { TrabajadoresService } from '../services/trabajadores.service';
import { CreateTrabajadorDto } from '../dto/create-trabajador.dto';
import { UpdateTrabajadorDto } from '../dto/update-trabajador.dto';
import { TrabajadorResponseDto } from '../dto/trabajador-response.dto';
import { TrabajadorFilterDto } from '../dto/trabajador-filter.dto';
import { BaseResponseDto, PaginatedResponseDto } from '../../../common/dto/base-response.dto';
import { JwtAuthGuard } from '../../../common/guards/auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/constants/roles.enum';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Trabajadores')
@Controller('trabajadores')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TrabajadoresController {
  constructor(private readonly trabajadoresService: TrabajadoresService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear nuevo trabajador (Solo Admin)' })
  @ApiResponse({ status: 201, description: 'Trabajador creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Trabajador ya existe' })
  async create(
    @Body() createTrabajadorDto: CreateTrabajadorDto,
  ): Promise<BaseResponseDto<TrabajadorResponseDto>> {
    const trabajador = await this.trabajadoresService.create(createTrabajadorDto);
    return new BaseResponseDto(trabajador, 'Trabajador creado exitosamente', HttpStatus.CREATED);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.LIDER_PROCESO)
  @ApiOperation({ summary: 'Obtener todos los trabajadores con paginación y filtros' })
  @ApiResponse({ status: 200, description: 'Trabajadores obtenidos exitosamente' })
  async findAll(
    @Query() filterDto: TrabajadorFilterDto,
  ): Promise<PaginatedResponseDto<TrabajadorResponseDto>> {
    const page = filterDto.page ?? 1;
    const limit = filterDto.limit ?? 10;

    const { trabajadores, total } = await this.trabajadoresService.findAll(
      page,
      limit,
      filterDto.estadoCanasta,
      filterDto.estadoRegalos,
      filterDto.auditorioCanasta,
      filterDto.search,
    );

    return new PaginatedResponseDto(
      trabajadores,
      total,
      page,
      limit,
      'Trabajadores obtenidos exitosamente',
    );
  }

  @Get('dni/:dni')
  @Roles(
    UserRole.ADMIN,
    UserRole.LIDER_PROCESO,
    UserRole.ASISTENTE_VENTANILLA,
    UserRole.SEGURIDAD_CANASTA,
    UserRole.SEGURIDAD_REGALOS,
    UserRole.ENCARGADO_ENTREGA_CANASTA,
    UserRole.ENCARGADO_ENTREGA_REGALOS,
  )
  @ApiOperation({ summary: 'Obtener trabajador por DNI' })
  @ApiResponse({ status: 200, description: 'Trabajador encontrado' })
  @ApiResponse({ status: 404, description: 'Trabajador no encontrado' })
  async findByDni(@Param('dni') dni: string): Promise<BaseResponseDto<TrabajadorResponseDto>> {
    const trabajador = await this.trabajadoresService.findByDni(dni);
    return new BaseResponseDto(trabajador, 'Trabajador encontrado');
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.LIDER_PROCESO)
  @ApiOperation({ summary: 'Obtener trabajador por ID' })
  @ApiResponse({ status: 200, description: 'Trabajador encontrado' })
  @ApiResponse({ status: 404, description: 'Trabajador no encontrado' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BaseResponseDto<TrabajadorResponseDto>> {
    const trabajador = await this.trabajadoresService.findOne(id);
    return new BaseResponseDto(trabajador, 'Trabajador encontrado');
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar trabajador por ID (Solo Admin)' })
  @ApiResponse({ status: 200, description: 'Trabajador actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Trabajador no encontrado' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTrabajadorDto: UpdateTrabajadorDto,
  ): Promise<BaseResponseDto<TrabajadorResponseDto>> {
    const trabajador = await this.trabajadoresService.update(id, updateTrabajadorDto);
    return new BaseResponseDto(trabajador, 'Trabajador actualizado exitosamente');
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar trabajador por ID (Solo Admin)' })
  @ApiResponse({ status: 204, description: 'Trabajador eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Trabajador no encontrado' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.trabajadoresService.remove(id);
  }
}