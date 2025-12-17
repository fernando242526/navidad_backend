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
import { RegalosService } from '../services/regalos.service';
import { CreateRegaloDto } from '../dto/create-regalo.dto';
import { UpdateRegaloDto } from '../dto/update-regalo.dto';
import { RegaloResponseDto } from '../dto/regalo-response.dto';
import { RegaloFilterDto } from '../dto/regalo-filter.dto';
import { BaseResponseDto, PaginatedResponseDto } from '../../../common/dto/base-response.dto';
import { JwtAuthGuard } from '../../../common/guards/auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/constants/roles.enum';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Regalos')
@Controller('regalos')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RegalosController {
  constructor(private readonly regalosService: RegalosService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear nuevo regalo (Solo Admin)' })
  @ApiResponse({ status: 201, description: 'Regalo creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Regalo ya existe' })
  async create(
    @Body() createRegaloDto: CreateRegaloDto,
  ): Promise<BaseResponseDto<RegaloResponseDto>> {
    const regalo = await this.regalosService.create(createRegaloDto);
    return new BaseResponseDto(regalo, 'Regalo creado exitosamente', HttpStatus.CREATED);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.LIDER_PROCESO)
  @ApiOperation({ summary: 'Obtener todos los regalos con paginación y filtros' })
  @ApiResponse({ status: 200, description: 'Regalos obtenidos exitosamente' })
  async findAll(
    @Query() filterDto: RegaloFilterDto,
  ): Promise<PaginatedResponseDto<RegaloResponseDto>> {
    const page = filterDto.page ?? 1;
    const limit = filterDto.limit ?? 10;

    const { regalos, total } = await this.regalosService.findAll(
      page,
      limit,
      filterDto.search,
    );

    return new PaginatedResponseDto(
      regalos,
      total,
      page,
      limit,
      'Regalos obtenidos exitosamente',
    );
  }

  @Get('codigo-qr/:codigoQr')
  @Roles(UserRole.ADMIN, UserRole.LIDER_PROCESO, UserRole.ENCARGADO_ENTREGA_REGALOS)
  @ApiOperation({ summary: 'Obtener regalo por código QR' })
  @ApiResponse({ status: 200, description: 'Regalo encontrado' })
  @ApiResponse({ status: 404, description: 'Regalo no encontrado' })
  async findByCodigoQr(@Param('codigoQr') codigoQr: string): Promise<BaseResponseDto<RegaloResponseDto>> {
    const regalo = await this.regalosService.findByCodigoQr(codigoQr);
    return new BaseResponseDto(regalo, 'Regalo encontrado');
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.LIDER_PROCESO)
  @ApiOperation({ summary: 'Obtener regalo por ID' })
  @ApiResponse({ status: 200, description: 'Regalo encontrado' })
  @ApiResponse({ status: 404, description: 'Regalo no encontrado' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BaseResponseDto<RegaloResponseDto>> {
    const regalo = await this.regalosService.findOne(id);
    return new BaseResponseDto(regalo, 'Regalo encontrado');
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar regalo por ID (Solo Admin)' })
  @ApiResponse({ status: 200, description: 'Regalo actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Regalo no encontrado' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRegaloDto: UpdateRegaloDto,
  ): Promise<BaseResponseDto<RegaloResponseDto>> {
    const regalo = await this.regalosService.update(id, updateRegaloDto);
    return new BaseResponseDto(regalo, 'Regalo actualizado exitosamente');
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar regalo por ID (Solo Admin)' })
  @ApiResponse({ status: 204, description: 'Regalo eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Regalo no encontrado' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.regalosService.remove(id);
  }
}