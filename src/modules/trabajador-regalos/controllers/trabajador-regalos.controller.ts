import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TrabajadorRegalosService } from '../services/trabajador-regalos.service';
import { CreateTrabajadorRegaloDto } from '../dto/create-trabajador-regalo.dto';
import { TrabajadorRegaloResponseDto } from '../dto/trabajador-regalo-response.dto';
import { TrabajadorRegaloFilterDto } from '../dto/trabajador-regalo-filter.dto';
import { BaseResponseDto, PaginatedResponseDto } from '../../../common/dto/base-response.dto';
import { JwtAuthGuard } from '../../../common/guards/auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/constants/roles.enum';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Trabajador-Regalos')
@Controller('trabajador-regalos')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TrabajadorRegalosController {
  constructor(private readonly trabajadorRegalosService: TrabajadorRegalosService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ENCARGADO_ENTREGA_REGALOS)
  @ApiOperation({ summary: 'Registrar entrega de regalos a trabajador' })
  @ApiResponse({ status: 201, description: 'Regalos registrados exitosamente' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Trabajador o Regalo no encontrado' })
  async create(
    @Body() createTrabajadorRegaloDto: CreateTrabajadorRegaloDto,
  ): Promise<BaseResponseDto<TrabajadorRegaloResponseDto[]>> {
    const trabajadorRegalos = await this.trabajadorRegalosService.create(createTrabajadorRegaloDto);
    return new BaseResponseDto(trabajadorRegalos, 'Regalos registrados exitosamente', HttpStatus.CREATED);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.LIDER_PROCESO)
  @ApiOperation({ summary: 'Obtener todos los registros de trabajador-regalos con paginación y filtros' })
  @ApiResponse({ status: 200, description: 'Registros obtenidos exitosamente' })
  async findAll(
    @Query() filterDto: TrabajadorRegaloFilterDto,
  ): Promise<PaginatedResponseDto<TrabajadorRegaloResponseDto>> {
    const page = filterDto.page ?? 1;
    const limit = filterDto.limit ?? 10;

    const { trabajadorRegalos, total } = await this.trabajadorRegalosService.findAll(
      page,
      limit,
      filterDto.idTrabajador,
      filterDto.idRegalo,
    );

    return new PaginatedResponseDto(
      trabajadorRegalos,
      total,
      page,
      limit,
      'Registros obtenidos exitosamente',
    );
  }

  @Get('trabajador/:idTrabajador')
  @Roles(UserRole.ADMIN, UserRole.LIDER_PROCESO, UserRole.ENCARGADO_ENTREGA_REGALOS)
  @ApiOperation({ summary: 'Obtener regalos entregados a un trabajador' })
  @ApiResponse({ status: 200, description: 'Regalos del trabajador obtenidos exitosamente' })
  async findByTrabajadorId(
    @Param('idTrabajador', ParseUUIDPipe) idTrabajador: string,
  ): Promise<BaseResponseDto<TrabajadorRegaloResponseDto[]>> {
    const trabajadorRegalos = await this.trabajadorRegalosService.findByTrabajadorId(idTrabajador);
    return new BaseResponseDto(trabajadorRegalos, 'Regalos del trabajador obtenidos exitosamente');
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.LIDER_PROCESO)
  @ApiOperation({ summary: 'Obtener registro de trabajador-regalo por ID' })
  @ApiResponse({ status: 200, description: 'Registro encontrado' })
  @ApiResponse({ status: 404, description: 'Registro no encontrado' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BaseResponseDto<TrabajadorRegaloResponseDto>> {
    const trabajadorRegalo = await this.trabajadorRegalosService.findOne(id);
    return new BaseResponseDto(trabajadorRegalo, 'Registro encontrado');
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar registro de trabajador-regalo por ID (Solo Admin)' })
  @ApiResponse({ status: 204, description: 'Registro eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Registro no encontrado' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.trabajadorRegalosService.remove(id);
  }

  @Delete('trabajador/:idTrabajador')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar todos los registros de un trabajador (Solo Admin)' })
  @ApiResponse({ status: 204, description: 'Registros eliminados exitosamente' })
  async removeByTrabajadorId(@Param('idTrabajador', ParseUUIDPipe) idTrabajador: string): Promise<void> {
    await this.trabajadorRegalosService.removeByTrabajadorId(idTrabajador);
  }
}