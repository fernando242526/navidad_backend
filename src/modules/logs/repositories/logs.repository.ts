import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Log } from '../entities/log.entity';

@Injectable()
export class LogsRepository {
  constructor(
    @InjectRepository(Log)
    private readonly logRepository: Repository<Log>,
  ) {}

  async create(createData: Partial<Log>): Promise<Log> {
    const log = this.logRepository.create(createData);
    return await this.logRepository.save(log);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    idTrabajador?: string,
    idUsuario?: string,
    fechaDesde?: Date,
    fechaHasta?: Date,
  ): Promise<{ logs: Log[]; total: number }> {
    const validatedPage = page > 0 ? page : 1;
    const validatedLimit = limit > 0 ? limit : 10;

    const whereConditions: FindOptionsWhere<Log> = {};

    if (idTrabajador !== undefined) {
      whereConditions.idTrabajador = idTrabajador;
    }

    if (idUsuario !== undefined) {
      whereConditions.idUsuario = idUsuario;
    }

    // Filtros de fecha
    if (fechaDesde && fechaHasta) {
      whereConditions.fechaHora = Between(fechaDesde, fechaHasta);
    } else if (fechaDesde) {
      whereConditions.fechaHora = MoreThanOrEqual(fechaDesde);
    } else if (fechaHasta) {
      whereConditions.fechaHora = LessThanOrEqual(fechaHasta);
    }

    const [logs, total] = await this.logRepository.findAndCount({
      where: whereConditions,
      relations: ['trabajador', 'usuario'],
      skip: (validatedPage - 1) * validatedLimit,
      take: validatedLimit,
      order: { fechaHora: 'DESC' },
    });

    return { logs, total };
  }

  async findOne(id: string): Promise<Log | null> {
    if (!id) {
      return null;
    }

    return await this.logRepository.findOne({
      where: { id },
      relations: ['trabajador', 'usuario'],
    });
  }

  async findByTrabajadorId(idTrabajador: string): Promise<Log[]> {
    if (!idTrabajador) {
      return [];
    }

    return await this.logRepository.find({
      where: { idTrabajador },
      relations: ['usuario'],
      order: { fechaHora: 'DESC' },
    });
  }

  async findByUsuarioId(idUsuario: string): Promise<Log[]> {
    if (!idUsuario) {
      return [];
    }

    return await this.logRepository.find({
      where: { idUsuario },
      relations: ['trabajador'],
      order: { fechaHora: 'DESC' },
    });
  }

  async remove(id: string): Promise<void> {
    if (!id) {
      return;
    }

    await this.logRepository.delete(id);
  }

  async count(): Promise<number> {
    return await this.logRepository.count();
  }

  async countByTrabajadorId(idTrabajador: string): Promise<number> {
    if (!idTrabajador) {
      return 0;
    }

    return await this.logRepository.count({ where: { idTrabajador } });
  }

  async countByUsuarioId(idUsuario: string): Promise<number> {
    if (!idUsuario) {
      return 0;
    }

    return await this.logRepository.count({ where: { idUsuario } });
  }
}