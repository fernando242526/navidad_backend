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
import { LogsService } from '../services/logs.service';
import { CreateLogDto } from '../dto/create-log.dto';
import { LogResponseDto } from '../dto/log-response.dto';
import { LogFilterDto } from '../dto/log-filter.dto';
import { BaseResponseDto, PaginatedResponseDto } from '../../../common/dto/base-response.dto';
import { JwtAuthGuard } from '../../../common/guards/auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/constants/roles.enum';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TrabajadorFlujoResponseDto } from '../dto/trabajador-flujo-response.dto';

@ApiTags('Logs')
@Controller('logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear nuevo log manualmente (Solo Admin para testing)' })
  @ApiResponse({ status: 201, description: 'Log creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Trabajador o Usuario no encontrado' })
  async create(
    @Body() createLogDto: CreateLogDto,
  ): Promise<BaseResponseDto<LogResponseDto>> {
    const log = await this.logsService.create(createLogDto);
    return new BaseResponseDto(log, 'Log creado exitosamente', HttpStatus.CREATED);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.LIDER_PROCESO)
  @ApiOperation({ summary: 'Obtener todos los logs con paginación y filtros' })
  @ApiResponse({ status: 200, description: 'Logs obtenidos exitosamente' })
  async findAll(
    @Query() filterDto: LogFilterDto,
  ): Promise<PaginatedResponseDto<LogResponseDto>> {
    const page = filterDto.page ?? 1;
    const limit = filterDto.limit ?? 10;

    const { logs, total } = await this.logsService.findAll(
      page,
      limit,
      filterDto.idTrabajador,
      filterDto.idUsuario,
      filterDto.fechaDesde,
      filterDto.fechaHasta,
    );

    return new PaginatedResponseDto(
      logs,
      total,
      page,
      limit,
      'Logs obtenidos exitosamente',
    );
  }

  @Get('trabajador/:idTrabajador')
  @Roles(UserRole.ADMIN, UserRole.LIDER_PROCESO)
  @ApiOperation({ summary: 'Obtener logs de un trabajador específico' })
  @ApiResponse({ status: 200, description: 'Logs del trabajador obtenidos exitosamente' })
  async findByTrabajadorId(
    @Param('idTrabajador', ParseUUIDPipe) idTrabajador: string,
  ): Promise<BaseResponseDto<LogResponseDto[]>> {
    const logs = await this.logsService.findByTrabajadorId(idTrabajador);
    return new BaseResponseDto(logs, 'Logs del trabajador obtenidos exitosamente');
  }

  @Get('trabajador/:idTrabajador/flujo')
  @Roles(UserRole.ADMIN, UserRole.LIDER_PROCESO)
  @ApiOperation({ summary: 'Obtener flujo completo del trabajador con resumen' })
  @ApiResponse({ status: 200, description: 'Flujo del trabajador obtenido exitosamente' })
  @ApiResponse({ status: 404, description: 'Trabajador no encontrado' })
  async findTrabajadorFlujo(
    @Param('idTrabajador', ParseUUIDPipe) idTrabajador: string,
  ): Promise<BaseResponseDto<TrabajadorFlujoResponseDto>> {
    const flujo = await this.logsService.findTrabajadorFlujo(idTrabajador);
    return new BaseResponseDto(flujo, 'Flujo del trabajador obtenido exitosamente');
  }

  @Get('usuario/:idUsuario')
  @Roles(UserRole.ADMIN, UserRole.LIDER_PROCESO)
  @ApiOperation({ summary: 'Obtener logs de un usuario específico' })
  @ApiResponse({ status: 200, description: 'Logs del usuario obtenidos exitosamente' })
  async findByUsuarioId(
    @Param('idUsuario', ParseUUIDPipe) idUsuario: string,
  ): Promise<BaseResponseDto<LogResponseDto[]>> {
    const logs = await this.logsService.findByUsuarioId(idUsuario);
    return new BaseResponseDto(logs, 'Logs del usuario obtenidos exitosamente');
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.LIDER_PROCESO)
  @ApiOperation({ summary: 'Obtener log por ID' })
  @ApiResponse({ status: 200, description: 'Log encontrado' })
  @ApiResponse({ status: 404, description: 'Log no encontrado' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BaseResponseDto<LogResponseDto>> {
    const log = await this.logsService.findOne(id);
    return new BaseResponseDto(log, 'Log encontrado');
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar log por ID (Solo Admin)' })
  @ApiResponse({ status: 204, description: 'Log eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Log no encontrado' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.logsService.remove(id);
  }
}