import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like } from 'typeorm';
import { Trabajador, EstadoCanasta, EstadoRegalos, AuditorioCanasta } from '../entities/trabajador.entity';

@Injectable()
export class TrabajadoresRepository {
  constructor(
    @InjectRepository(Trabajador)
    private readonly trabajadorRepository: Repository<Trabajador>,
  ) {}

  async create(createData: Partial<Trabajador>): Promise<Trabajador> {
    const trabajador = this.trabajadorRepository.create(createData);
    return await this.trabajadorRepository.save(trabajador);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    estadoCanasta?: EstadoCanasta,
    estadoRegalos?: EstadoRegalos,
    auditorioCanasta?: AuditorioCanasta,
    search?: string,
  ): Promise<{ trabajadores: Trabajador[]; total: number }> {
    const validatedPage = page > 0 ? page : 1;
    const validatedLimit = limit > 0 ? limit : 10;

    const whereConditions: FindOptionsWhere<Trabajador> = {};

    if (estadoCanasta !== undefined) {
      whereConditions.estadoCanasta = estadoCanasta;
    }

    if (estadoRegalos !== undefined) {
      whereConditions.estadoRegalos = estadoRegalos;
    }

    if (auditorioCanasta !== undefined) {
      whereConditions.auditorioCanasta = auditorioCanasta;
    }

    if (search !== undefined && search.trim() !== '') {
      whereConditions.nombresCompletos = Like(`%${search.trim()}%`);
    }

    const [trabajadores, total] = await this.trabajadorRepository.findAndCount({
      where: whereConditions,
      skip: (validatedPage - 1) * validatedLimit,
      take: validatedLimit,
      order: { createdAt: 'DESC' },
    });

    return { trabajadores, total };
  }

  async findOne(id: string): Promise<Trabajador | null> {
    if (!id) {
      return null;
    }

    return await this.trabajadorRepository.findOne({
      where: { id },
    });
  }

  async findByDni(dni: string): Promise<Trabajador | null> {
    if (!dni) {
      return null;
    }

    return await this.trabajadorRepository.findOne({
      where: { dni },
    });
  }

  async update(id: string, updateData: Partial<Trabajador>): Promise<Trabajador | null> {
    if (!id) {
      return null;
    }

    await this.trabajadorRepository.update(id, updateData);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    if (!id) {
      return;
    }

    await this.trabajadorRepository.delete(id);
  }

  async count(): Promise<number> {
    return await this.trabajadorRepository.count();
  }

  async countByEstadoCanasta(estadoCanasta: EstadoCanasta): Promise<number> {
    return await this.trabajadorRepository.count({ where: { estadoCanasta } });
  }

  async countByEstadoRegalos(estadoRegalos: EstadoRegalos): Promise<number> {
    return await this.trabajadorRepository.count({ where: { estadoRegalos } });
  }
}