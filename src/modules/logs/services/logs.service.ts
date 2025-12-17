import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { LogsRepository } from '../repositories/logs.repository';
import { CreateLogDto } from '../dto/create-log.dto';
import { LogResponseDto } from '../dto/log-response.dto';
import { APP_CONSTANTS } from '../../../common/constants/app.constants';
import { TrabajadoresRepository } from '../../trabajadores/repositories/trabajadores.repository';
import { UsersRepository } from '../../users/repositories/users.repository';
import { TrabajadorResponseDto } from '../../trabajadores/dto/trabajador-response.dto';
import { UserResponseDto } from '../../users/dto/user-response.dto';

@Injectable()
export class LogsService {
  constructor(
    private readonly logsRepository: LogsRepository,
    private readonly trabajadoresRepository: TrabajadoresRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async create(createLogDto: CreateLogDto): Promise<LogResponseDto> {
    const { idTrabajador, idUsuario, peticionHecha } = createLogDto;

    // Verificar que el trabajador existe
    const trabajador = await this.trabajadoresRepository.findOne(idTrabajador);
    if (!trabajador) {
      throw new NotFoundException('Trabajador not found');
    }

    // Verificar que el usuario existe
    const usuario = await this.usersRepository.findOne(idUsuario);
    if (!usuario) {
      throw new NotFoundException('Usuario not found');
    }

    // Crear el log
    const log = await this.logsRepository.create({
      idTrabajador,
      idUsuario,
      peticionHecha,
      fechaHora: new Date(),
    });

    return new LogResponseDto({
      ...log,
      trabajador: new TrabajadorResponseDto(trabajador),
      usuario: new UserResponseDto(usuario),
    });
  }

  async findAll(
    page: number = APP_CONSTANTS.PAGINATION.DEFAULT_PAGE,
    limit: number = APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT,
    idTrabajador?: string,
    idUsuario?: string,
    fechaDesde?: string,
    fechaHasta?: string,
  ): Promise<{ logs: LogResponseDto[]; total: number }> {
    const validatedPage = page && page > 0 ? page : APP_CONSTANTS.PAGINATION.DEFAULT_PAGE;
    const validatedLimit = limit && limit > 0 ? Math.min(limit, APP_CONSTANTS.PAGINATION.MAX_LIMIT) : APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT;

    // Convertir fechas string a Date
    const fechaDesdeDate = fechaDesde ? new Date(fechaDesde) : undefined;
    const fechaHastaDate = fechaHasta ? new Date(fechaHasta) : undefined;

    const { logs, total } = await this.logsRepository.findAll(
      validatedPage,
      validatedLimit,
      idTrabajador,
      idUsuario,
      fechaDesdeDate,
      fechaHastaDate,
    );

    const logResponseDtos = logs.map(log => {
      const dto = new LogResponseDto(log);
      if (log.trabajador) {
        dto.trabajador = new TrabajadorResponseDto(log.trabajador);
      }
      if (log.usuario) {
        dto.usuario = new UserResponseDto(log.usuario);
      }
      return dto;
    });

    return { logs: logResponseDtos, total };
  }

  async findOne(id: string): Promise<LogResponseDto> {
    if (!id) {
      throw new BadRequestException('Log ID is required');
    }

    const log = await this.logsRepository.findOne(id);
    if (!log) {
      throw new NotFoundException('Log not found');
    }

    const dto = new LogResponseDto(log);
    if (log.trabajador) {
      dto.trabajador = new TrabajadorResponseDto(log.trabajador);
    }
    if (log.usuario) {
      dto.usuario = new UserResponseDto(log.usuario);
    }

    return dto;
  }

  async findByTrabajadorId(idTrabajador: string): Promise<LogResponseDto[]> {
    if (!idTrabajador) {
      throw new BadRequestException('Trabajador ID is required');
    }

    const logs = await this.logsRepository.findByTrabajadorId(idTrabajador);

    return logs.map(log => {
      const dto = new LogResponseDto(log);
      if (log.usuario) {
        dto.usuario = new UserResponseDto(log.usuario);
      }
      return dto;
    });
  }

  async findByUsuarioId(idUsuario: string): Promise<LogResponseDto[]> {
    if (!idUsuario) {
      throw new BadRequestException('Usuario ID is required');
    }

    const logs = await this.logsRepository.findByUsuarioId(idUsuario);

    return logs.map(log => {
      const dto = new LogResponseDto(log);
      if (log.trabajador) {
        dto.trabajador = new TrabajadorResponseDto(log.trabajador);
      }
      return dto;
    });
  }

  async remove(id: string): Promise<void> {
    if (!id) {
      throw new BadRequestException('Log ID is required');
    }

    const log = await this.logsRepository.findOne(id);
    if (!log) {
      throw new NotFoundException('Log not found');
    }

    await this.logsRepository.remove(id);
  }
}