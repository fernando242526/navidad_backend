import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TrabajadoresRepository } from '../../trabajadores/repositories/trabajadores.repository';
import { CanastasRepository } from '../../canastas/repositories/canastas.repository';
import { RegalosRepository } from '../../regalos/repositories/regalos.repository';
import { TrabajadorRegalosRepository } from '../../trabajador-regalos/repositories/trabajador-regalos.repository';
import { LogsRepository } from '../../logs/repositories/logs.repository';
import { TrabajadorResponseDto } from '../../trabajadores/dto/trabajador-response.dto';
import { CanastaResponseDto } from '../../canastas/dto/canasta-response.dto';
import { RegaloResponseDto } from '../../regalos/dto/regalo-response.dto';
import { EstadoCanasta, EstadoRegalos } from '../../trabajadores/entities/trabajador.entity';
import { RegistrarVentanillaDto } from '../dto/registrar-ventanilla.dto';
import { RegistrarIngresoAuditorioDto } from '../dto/registrar-ingreso-auditorio.dto';
import { ValidarCanastaDto } from '../dto/validar-canasta.dto';
import { EntregarCanastaDto } from '../dto/entregar-canasta.dto';
import { ValidarRegaloDto } from '../dto/validar-regalo.dto';
import { EntregarRegalosDto } from '../dto/entregar-regalos.dto';

@Injectable()
export class FlujoService {
  constructor(
    private readonly trabajadoresRepository: TrabajadoresRepository,
    private readonly canastasRepository: CanastasRepository,
    private readonly regalosRepository: RegalosRepository,
    private readonly trabajadorRegalosRepository: TrabajadorRegalosRepository,
    private readonly logsRepository: LogsRepository,
    private readonly dataSource: DataSource,
  ) {}

  // ========================================
  // ASISTENTE_VENTANILLA
  // ========================================

  async obtenerTrabajadorPorDni(dni: string, idUsuario: string): Promise<TrabajadorResponseDto> {
    const trabajador = await this.trabajadoresRepository.findByDni(dni);
    if (!trabajador) {
      throw new NotFoundException('Trabajador no encontrado');
    }

    // Guardar log
    await this.logsRepository.create({
      idTrabajador: trabajador.id,
      idUsuario,
      peticionHecha: `GET /flujo/trabajador/dni/${dni}`,
      fechaHora: new Date(),
    });

    return new TrabajadorResponseDto(trabajador);
  }

  async registrarVentanilla(
    registrarVentanillaDto: RegistrarVentanillaDto,
    idUsuario: string,
  ): Promise<{ message: string; trabajador: TrabajadorResponseDto }> {
    const { dni } = registrarVentanillaDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const trabajador = await this.trabajadoresRepository.findByDni(dni);
      if (!trabajador) {
        throw new NotFoundException('Trabajador no encontrado');
      }

      // Validar que no haya pasado ya por ventanilla
      if (trabajador.estadoCanasta !== EstadoCanasta.PENDIENTE) {
        await queryRunner.rollbackTransaction();
        return {
          message: `El trabajador ya fue registrado en ventanilla. Estado actual: ${trabajador.estadoCanasta}`,
          trabajador: new TrabajadorResponseDto(trabajador),
        };
      }

      // Preparar datos de actualización
      const updateData: any = {
        estadoCanasta: EstadoCanasta.VENTANILLA_ESCANEADO,
      };

      // Solo actualizar estadoRegalos si NO es NO_RECIBE
      if (trabajador.estadoRegalos !== EstadoRegalos.NO_RECIBE) {
        updateData.estadoRegalos = EstadoRegalos.VENTANILLA_ESCANEADO;
      }

      // Actualizar estados
      const trabajadorActualizado = await this.trabajadoresRepository.update(trabajador.id, updateData);

      // Guardar log
      await this.logsRepository.create({
        idTrabajador: trabajador.id,
        idUsuario,
        peticionHecha: `PATCH /flujo/ventanilla/registrar - DNI: ${dni}`,
        fechaHora: new Date(),
      });

      await queryRunner.commitTransaction();

      return {
        message: 'Trabajador registrado en ventanilla exitosamente',
        trabajador: new TrabajadorResponseDto(trabajadorActualizado!),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ========================================
  // SEGURIDAD_CANASTA
  // ========================================

  async registrarIngresoAuditorioCanasta(
    registrarIngresoDto: RegistrarIngresoAuditorioDto,
    idUsuario: string,
  ): Promise<{ message: string; trabajador: TrabajadorResponseDto }> {
    const { dni } = registrarIngresoDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const trabajador = await this.trabajadoresRepository.findByDni(dni);
      if (!trabajador) {
        throw new NotFoundException('Trabajador no encontrado');
      }

      // ✅ CASO 1: Ya recibió su canasta - NO PERMITIR INGRESO
      if (trabajador.estadoCanasta === EstadoCanasta.CANASTA_ENTREGADA) {
        await queryRunner.rollbackTransaction();
        return {
          message: 'El trabajador ya recibió su canasta y no puede ingresar nuevamente',
          trabajador: new TrabajadorResponseDto(trabajador),
        };
      }

      // ✅ CASO 2: Ya ingresó al auditorio - PERMITIR INGRESO (sin cambiar estado)
      if (trabajador.estadoCanasta === EstadoCanasta.AUDITORIO_INGRESADO) {
        // Guardar log pero no cambiar estado
        await this.logsRepository.create({
          idTrabajador: trabajador.id,
          idUsuario,
          peticionHecha: `PATCH /flujo/seguridad-canasta/ingreso - DNI: ${dni} (RE-INGRESO)`,
          fechaHora: new Date(),
        });

        await queryRunner.commitTransaction();

        return {
          message: 'Ingreso permitido - El trabajador ya estaba registrado en el auditorio',
          trabajador: new TrabajadorResponseDto(trabajador),
        };
      }

      // ✅ CASO 3: Viene de ventanilla - PERMITIR INGRESO Y CAMBIAR ESTADO
      if (trabajador.estadoCanasta === EstadoCanasta.VENTANILLA_ESCANEADO) {
        // Actualizar estado a AUDITORIO_INGRESADO
        const trabajadorActualizado = await this.trabajadoresRepository.update(trabajador.id, {
          estadoCanasta: EstadoCanasta.AUDITORIO_INGRESADO,
        });

        // Guardar log
        await this.logsRepository.create({
          idTrabajador: trabajador.id,
          idUsuario,
          peticionHecha: `PATCH /flujo/seguridad-canasta/ingreso - DNI: ${dni}`,
          fechaHora: new Date(),
        });

        await queryRunner.commitTransaction();

        return {
          message: 'Ingreso al auditorio de canastas registrado exitosamente',
          trabajador: new TrabajadorResponseDto(trabajadorActualizado!),
        };
      }

      // ✅ CASO 4: No pasó por ventanilla - NO PERMITIR INGRESO
      if (trabajador.estadoCanasta === EstadoCanasta.PENDIENTE) {
        await queryRunner.rollbackTransaction();
        throw new BadRequestException(
          `El trabajador debe pasar primero por ventanilla. Estado actual: ${trabajador.estadoCanasta}`,
        );
      }

      // ❌ CASO DEFAULT: Estado no reconocido
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(`Estado de canasta no reconocido: ${trabajador.estadoCanasta}`);
      
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ========================================
  // SEGURIDAD_REGALOS
  // ========================================

  async registrarIngresoAuditorioRegalos(
    registrarIngresoDto: RegistrarIngresoAuditorioDto,
    idUsuario: string,
  ): Promise<{ message: string; trabajador: TrabajadorResponseDto }> {
    const { dni } = registrarIngresoDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const trabajador = await this.trabajadoresRepository.findByDni(dni);
      if (!trabajador) {
        throw new NotFoundException('Trabajador no encontrado');
      }

      // ✅ VALIDACIÓN 1: Verificar que tiene asignado auditorio de juguetes
      if (!trabajador.auditorioJuguetes) {
        await queryRunner.rollbackTransaction();
        throw new BadRequestException('El trabajador no tiene asignado recepción de juguetes');
      }

      // ✅ CASO 1: Ya recibió sus juguetes - NO PERMITIR INGRESO
      if (trabajador.estadoRegalos === EstadoRegalos.JUGUETES_ENTREGADOS) {
        await queryRunner.rollbackTransaction();
        return {
          message: 'El trabajador ya recibió sus juguetes y no puede ingresar nuevamente',
          trabajador: new TrabajadorResponseDto(trabajador),
        };
      }

      // ✅ CASO 2: Ya ingresó al auditorio - PERMITIR INGRESO (sin cambiar estado)
      if (trabajador.estadoRegalos === EstadoRegalos.AUDITORIO_INGRESADO) {
        // Guardar log pero no cambiar estado
        await this.logsRepository.create({
          idTrabajador: trabajador.id,
          idUsuario,
          peticionHecha: `PATCH /flujo/seguridad-regalos/ingreso - DNI: ${dni} (RE-INGRESO)`,
          fechaHora: new Date(),
        });

        await queryRunner.commitTransaction();

        return {
          message: 'Ingreso permitido - El trabajador ya estaba registrado en el auditorio',
          trabajador: new TrabajadorResponseDto(trabajador),
        };
      }

      // ✅ CASO 3: Viene de ventanilla - PERMITIR INGRESO Y CAMBIAR ESTADO
      if (trabajador.estadoRegalos === EstadoRegalos.VENTANILLA_ESCANEADO) {
        // Actualizar estado a AUDITORIO_INGRESADO
        const trabajadorActualizado = await this.trabajadoresRepository.update(trabajador.id, {
          estadoRegalos: EstadoRegalos.AUDITORIO_INGRESADO,
        });

        // Guardar log
        await this.logsRepository.create({
          idTrabajador: trabajador.id,
          idUsuario,
          peticionHecha: `PATCH /flujo/seguridad-regalos/ingreso - DNI: ${dni}`,
          fechaHora: new Date(),
        });

        await queryRunner.commitTransaction();

        return {
          message: 'Ingreso al auditorio de regalos registrado exitosamente',
          trabajador: new TrabajadorResponseDto(trabajadorActualizado!),
        };
      }

      // ✅ CASO 4: No pasó por ventanilla - NO PERMITIR INGRESO
      if (trabajador.estadoRegalos === EstadoRegalos.PENDIENTE) {
        await queryRunner.rollbackTransaction();
        throw new BadRequestException(
          `El trabajador debe pasar primero por ventanilla. Estado actual: ${trabajador.estadoRegalos}`,
        );
      }

      // ❌ CASO DEFAULT: Estado no reconocido
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(`Estado de regalos no reconocido: ${trabajador.estadoRegalos}`);
      
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ========================================
  // ENCARGADO_ENTREGA_CANASTA
  // ========================================

  // AGRRGAR DNI LECTUR DE CODIGO DE BARRAS, CONTEO POR PERSONA DE 1++, POR USUARIO Y CADA QUE REGISTRA, 

  async validarCanasta(
    validarCanastaDto: ValidarCanastaDto,
    idUsuario: string,
  ): Promise<{ message: string; canasta: CanastaResponseDto }> {
    const { codigoQr } = validarCanastaDto;

    const canasta = await this.canastasRepository.findByCodigoQr(codigoQr);
    if (!canasta) {
      throw new NotFoundException('Canasta no encontrada');
    }

    // No guardar log aquí según tus instrucciones, solo validar

    return {
      message: 'Canasta válida',
      canasta: new CanastaResponseDto(canasta),
    };
  }

  async entregarCanasta(
    entregarCanastaDto: EntregarCanastaDto,
    idUsuario: string,
  ): Promise<{ message: string; trabajador: TrabajadorResponseDto }> {
    const { dni, idCanasta } = entregarCanastaDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const trabajador = await this.trabajadoresRepository.findByDni(dni);
      if (!trabajador) {
        throw new NotFoundException('Trabajador no encontrado');
      }

      // Validar que la canasta existe
      const canasta = await this.canastasRepository.findOne(idCanasta);
      if (!canasta) {
        throw new NotFoundException('Canasta no encontrada');
      }

      // Validar estado actual
      if (trabajador.estadoCanasta === EstadoCanasta.CANASTA_ENTREGADA) {
        await queryRunner.rollbackTransaction();
        return {
          message: 'El trabajador ya recibió su canasta',
          trabajador: new TrabajadorResponseDto(trabajador),
        };
      }

      // Validar que ingresó al auditorio
      if (trabajador.estadoCanasta !== EstadoCanasta.AUDITORIO_INGRESADO) {
        await queryRunner.rollbackTransaction();
        throw new BadRequestException(
          `El trabajador debe ingresar primero al auditorio. Estado actual: ${trabajador.estadoCanasta}`,
        );
      }

      // Actualizar trabajador
      const trabajadorActualizado = await this.trabajadoresRepository.update(trabajador.id, {
        estadoCanasta: EstadoCanasta.CANASTA_ENTREGADA,
        idCanasta: canasta.id,
        fechaHoraEntregaCanasta: new Date(),
      });

      // Guardar log
      await this.logsRepository.create({
        idTrabajador: trabajador.id,
        idUsuario,
        peticionHecha: `POST /flujo/encargado-canasta/entregar - DNI: ${dni}, Canasta: ${canasta.codigoQr}`,
        fechaHora: new Date(),
      });

      await queryRunner.commitTransaction();

      return {
        message: 'Canasta entregada exitosamente',
        trabajador: new TrabajadorResponseDto(trabajadorActualizado!),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ========================================
  // ENCARGADO_ENTREGA_REGALOS
  // ========================================

  async validarRegalo(
    validarRegaloDto: ValidarRegaloDto,
    idUsuario: string,
  ): Promise<{ message: string; regalo: RegaloResponseDto }> {
    const { codigoQr } = validarRegaloDto;

    const regalo = await this.regalosRepository.findByCodigoQr(codigoQr);
    if (!regalo) {
      throw new NotFoundException('Regalo no encontrado');
    }

    // No guardar log aquí según tus instrucciones, solo validar

    return {
      message: 'Regalo válido',
      regalo: new RegaloResponseDto(regalo),
    };
  }

  async entregarRegalos(
    entregarRegalosDto: EntregarRegalosDto,
    idUsuario: string,
  ): Promise<{ message: string; trabajador: TrabajadorResponseDto }> {
    const { dni, regalos } = entregarRegalosDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const trabajador = await this.trabajadoresRepository.findByDni(dni);
      if (!trabajador) {
        throw new NotFoundException('Trabajador no encontrado');
      }

      // Validar que tiene asignado auditorio de juguetes
      if (!trabajador.auditorioJuguetes) {
        await queryRunner.rollbackTransaction();
        throw new BadRequestException('El trabajador no tiene asignado recepción de juguetes');
      }

      // Validar que todos los regalos existen
      const regalosEntities = await this.regalosRepository.findByIds(regalos);
      if (regalosEntities.length !== regalos.length) {
        await queryRunner.rollbackTransaction();
        throw new BadRequestException('Uno o más regalos no encontrados');
      }

      // Validar estado actual
      if (trabajador.estadoRegalos === EstadoRegalos.JUGUETES_ENTREGADOS) {
        await queryRunner.rollbackTransaction();
        return {
          message: 'El trabajador ya recibió sus juguetes',
          trabajador: new TrabajadorResponseDto(trabajador),
        };
      }

      // Validar que ingresó al auditorio
      if (trabajador.estadoRegalos !== EstadoRegalos.AUDITORIO_INGRESADO) {
        await queryRunner.rollbackTransaction();
        throw new BadRequestException(
          `El trabajador debe ingresar primero al auditorio. Estado actual: ${trabajador.estadoRegalos}`,
        );
      }

      // Actualizar trabajador
      const trabajadorActualizado = await this.trabajadoresRepository.update(trabajador.id, {
        estadoRegalos: EstadoRegalos.JUGUETES_ENTREGADOS,
        fechaHoraEntregaJuguetes: new Date(),
      });

      // Registrar regalos en tabla intermedia
      const createDataArray = regalos.map(idRegalo => ({
        idTrabajador: trabajador.id,
        idRegalo,
      }));
      await this.trabajadorRegalosRepository.createMany(createDataArray);

      // Guardar log
      const codigosQr = regalosEntities.map(r => r.codigoQr).join(', ');
      await this.logsRepository.create({
        idTrabajador: trabajador.id,
        idUsuario,
        peticionHecha: `POST /flujo/encargado-regalos/entregar - DNI: ${dni}, Regalos: ${codigosQr}`,
        fechaHora: new Date(),
      });

      await queryRunner.commitTransaction();

      return {
        message: 'Regalos entregados exitosamente',
        trabajador: new TrabajadorResponseDto(trabajadorActualizado!),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}