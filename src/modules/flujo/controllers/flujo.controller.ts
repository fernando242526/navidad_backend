import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FlujoService } from '../services/flujo.service';
import { RegistrarVentanillaDto } from '../dto/registrar-ventanilla.dto';
import { RegistrarIngresoAuditorioDto } from '../dto/registrar-ingreso-auditorio.dto';
import { ValidarCanastaDto } from '../dto/validar-canasta.dto';
import { EntregarCanastaDto } from '../dto/entregar-canasta.dto';
import { ValidarRegaloDto } from '../dto/validar-regalo.dto';
import { EntregarRegalosDto } from '../dto/entregar-regalos.dto';
import { TrabajadorResponseDto } from '../../trabajadores/dto/trabajador-response.dto';
import { CanastaResponseDto } from '../../canastas/dto/canasta-response.dto';
import { RegaloResponseDto } from '../../regalos/dto/regalo-response.dto';
import { BaseResponseDto } from '../../../common/dto/base-response.dto';
import { JwtAuthGuard } from '../../../common/guards/auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '../../../common/constants/roles.enum';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Flujo')
@Controller('flujo')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FlujoController {
  constructor(private readonly flujoService: FlujoService) {}

  // ========================================
  // ASISTENTE_VENTANILLA
  // ========================================

  @Get('trabajador/dni/:dni')
  @Roles(
    UserRole.ASISTENTE_VENTANILLA,
    UserRole.SEGURIDAD_CANASTA,
    UserRole.SEGURIDAD_REGALOS,
    UserRole.ENCARGADO_ENTREGA_CANASTA,
    UserRole.ENCARGADO_ENTREGA_REGALOS,
    UserRole.ADMIN,
    UserRole.LIDER_PROCESO,
  )
  @ApiOperation({ summary: 'Obtener trabajador por DNI (escaneo QR)' })
  @ApiResponse({ status: 200, description: 'Trabajador encontrado' })
  @ApiResponse({ status: 404, description: 'Trabajador no encontrado' })
  async obtenerTrabajadorPorDni(
    @Param('dni') dni: string,
    @CurrentUser('id') idUsuario: string,
  ): Promise<BaseResponseDto<TrabajadorResponseDto>> {
    const trabajador = await this.flujoService.obtenerTrabajadorPorDni(dni, idUsuario);
    return new BaseResponseDto(trabajador, 'Trabajador encontrado');
  }

  @Post('ventanilla/registrar')
  @Roles(UserRole.ASISTENTE_VENTANILLA)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Registrar trabajador en ventanilla (Solo ASISTENTE_VENTANILLA)' })
  @ApiResponse({ status: 200, description: 'Trabajador registrado en ventanilla' })
  @ApiResponse({ status: 404, description: 'Trabajador no encontrado' })
  async registrarVentanilla(
    @Body() registrarVentanillaDto: RegistrarVentanillaDto,
    @CurrentUser('id') idUsuario: string,
  ): Promise<BaseResponseDto<{ message: string; trabajador: TrabajadorResponseDto }>> {
    const result = await this.flujoService.registrarVentanilla(registrarVentanillaDto, idUsuario);
    return new BaseResponseDto(result, result.message);
  }

  // ========================================
  // SEGURIDAD_CANASTA
  // ========================================

  @Post('seguridad-canasta/ingreso')
  @Roles(UserRole.SEGURIDAD_CANASTA)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Registrar ingreso al auditorio de canastas (Solo SEGURIDAD_CANASTA)' })
  @ApiResponse({ status: 200, description: 'Ingreso registrado exitosamente' })
  @ApiResponse({ status: 400, description: 'El trabajador no cumple con los requisitos' })
  @ApiResponse({ status: 404, description: 'Trabajador no encontrado' })
  async registrarIngresoAuditorioCanasta(
    @Body() registrarIngresoDto: RegistrarIngresoAuditorioDto,
    @CurrentUser('id') idUsuario: string,
  ): Promise<BaseResponseDto<{ message: string; trabajador: TrabajadorResponseDto }>> {
    const result = await this.flujoService.registrarIngresoAuditorioCanasta(
      registrarIngresoDto,
      idUsuario,
    );
    return new BaseResponseDto(result, result.message);
  }

  // ========================================
  // SEGURIDAD_REGALOS
  // ========================================

  @Post('seguridad-regalos/ingreso')
  @Roles(UserRole.SEGURIDAD_REGALOS)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Registrar ingreso al auditorio de regalos (Solo SEGURIDAD_REGALOS)' })
  @ApiResponse({ status: 200, description: 'Ingreso registrado exitosamente' })
  @ApiResponse({ status: 400, description: 'El trabajador no cumple con los requisitos' })
  @ApiResponse({ status: 404, description: 'Trabajador no encontrado' })
  async registrarIngresoAuditorioRegalos(
    @Body() registrarIngresoDto: RegistrarIngresoAuditorioDto,
    @CurrentUser('id') idUsuario: string,
  ): Promise<BaseResponseDto<{ message: string; trabajador: TrabajadorResponseDto }>> {
    const result = await this.flujoService.registrarIngresoAuditorioRegalos(
      registrarIngresoDto,
      idUsuario,
    );
    return new BaseResponseDto(result, result.message);
  }

  // ========================================
  // ENCARGADO_ENTREGA_CANASTA
  // ========================================

  @Post('encargado-canasta/validar-canasta')
  @Roles(UserRole.ENCARGADO_ENTREGA_CANASTA)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validar código QR de canasta (Solo ENCARGADO_ENTREGA_CANASTA)' })
  @ApiResponse({ status: 200, description: 'Canasta válida' })
  @ApiResponse({ status: 404, description: 'Canasta no encontrada' })
  async validarCanasta(
    @Body() validarCanastaDto: ValidarCanastaDto,
    @CurrentUser('id') idUsuario: string,
  ): Promise<BaseResponseDto<{ message: string; canasta: CanastaResponseDto }>> {
    const result = await this.flujoService.validarCanasta(validarCanastaDto, idUsuario);
    return new BaseResponseDto(result, result.message);
  }

  @Post('encargado-canasta/entregar')
  @Roles(UserRole.ENCARGADO_ENTREGA_CANASTA)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Registrar entrega de canasta (Solo ENCARGADO_ENTREGA_CANASTA)' })
  @ApiResponse({ status: 200, description: 'Canasta entregada exitosamente' })
  @ApiResponse({ status: 400, description: 'El trabajador no cumple con los requisitos' })
  @ApiResponse({ status: 404, description: 'Trabajador o canasta no encontrado' })
  async entregarCanasta(
    @Body() entregarCanastaDto: EntregarCanastaDto,
    @CurrentUser('id') idUsuario: string,
  ): Promise<BaseResponseDto<{ message: string; trabajador: TrabajadorResponseDto }>> {
    const result = await this.flujoService.entregarCanasta(entregarCanastaDto, idUsuario);
    return new BaseResponseDto(result, result.message);
  }

  // ========================================
  // ENCARGADO_ENTREGA_REGALOS
  // ========================================

  @Post('encargado-regalos/validar-regalo')
  @Roles(UserRole.ENCARGADO_ENTREGA_REGALOS)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validar código QR de regalo (Solo ENCARGADO_ENTREGA_REGALOS)' })
  @ApiResponse({ status: 200, description: 'Regalo válido' })
  @ApiResponse({ status: 404, description: 'Regalo no encontrado' })
  async validarRegalo(
    @Body() validarRegaloDto: ValidarRegaloDto,
    @CurrentUser('id') idUsuario: string,
  ): Promise<BaseResponseDto<{ message: string; regalo: RegaloResponseDto }>> {
    const result = await this.flujoService.validarRegalo(validarRegaloDto, idUsuario);
    return new BaseResponseDto(result, result.message);
  }

  @Post('encargado-regalos/entregar')
  @Roles(UserRole.ENCARGADO_ENTREGA_REGALOS)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Registrar entrega de regalos (Solo ENCARGADO_ENTREGA_REGALOS)' })
  @ApiResponse({ status: 200, description: 'Regalos entregados exitosamente' })
  @ApiResponse({ status: 400, description: 'El trabajador no cumple con los requisitos' })
  @ApiResponse({ status: 404, description: 'Trabajador o regalos no encontrados' })
  async entregarRegalos(
    @Body() entregarRegalosDto: EntregarRegalosDto,
    @CurrentUser('id') idUsuario: string,
  ): Promise<BaseResponseDto<{ message: string; trabajador: TrabajadorResponseDto }>> {
    const result = await this.flujoService.entregarRegalos(entregarRegalosDto, idUsuario);
    return new BaseResponseDto(result, result.message);
  }
}