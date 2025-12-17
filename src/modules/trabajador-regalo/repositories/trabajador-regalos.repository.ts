import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { TrabajadorRegalo } from '../entities/trabajador-regalo.entity';

@Injectable()
export class TrabajadorRegalosRepository {
  constructor(
    @InjectRepository(TrabajadorRegalo)
    private readonly trabajadorRegaloRepository: Repository<TrabajadorRegalo>,
  ) {}

  async create(createData: Partial<TrabajadorRegalo>): Promise<TrabajadorRegalo> {
    const trabajadorRegalo = this.trabajadorRegaloRepository.create(createData);
    return await this.trabajadorRegaloRepository.save(trabajadorRegalo);
  }

  async createMany(createDataArray: Partial<TrabajadorRegalo>[]): Promise<TrabajadorRegalo[]> {
    const trabajadorRegalos = this.trabajadorRegaloRepository.create(createDataArray);
    return await this.trabajadorRegaloRepository.save(trabajadorRegalos);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    idTrabajador?: string,
    idRegalo?: string,
  ): Promise<{ trabajadorRegalos: TrabajadorRegalo[]; total: number }> {
    const validatedPage = page > 0 ? page : 1;
    const validatedLimit = limit > 0 ? limit : 10;

    const whereConditions: FindOptionsWhere<TrabajadorRegalo> = {};

    if (idTrabajador !== undefined) {
      whereConditions.idTrabajador = idTrabajador;
    }

    if (idRegalo !== undefined) {
      whereConditions.idRegalo = idRegalo;
    }

    const [trabajadorRegalos, total] = await this.trabajadorRegaloRepository.findAndCount({
      where: whereConditions,
      relations: ['trabajador', 'regalo'],
      skip: (validatedPage - 1) * validatedLimit,
      take: validatedLimit,
      order: { createdAt: 'DESC' },
    });

    return { trabajadorRegalos, total };
  }

  async findOne(id: string): Promise<TrabajadorRegalo | null> {
    if (!id) {
      return null;
    }

    return await this.trabajadorRegaloRepository.findOne({
      where: { id },
      relations: ['trabajador', 'regalo'],
    });
  }

  async findByTrabajadorId(idTrabajador: string): Promise<TrabajadorRegalo[]> {
    if (!idTrabajador) {
      return [];
    }

    return await this.trabajadorRegaloRepository.find({
      where: { idTrabajador },
      relations: ['regalo'],
      order: { createdAt: 'ASC' },
    });
  }

  async findByRegaloId(idRegalo: string): Promise<TrabajadorRegalo[]> {
    if (!idRegalo) {
      return [];
    }

    return await this.trabajadorRegaloRepository.find({
      where: { idRegalo },
      relations: ['trabajador'],
      order: { createdAt: 'ASC' },
    });
  }

  async remove(id: string): Promise<void> {
    if (!id) {
      return;
    }

    await this.trabajadorRegaloRepository.delete(id);
  }

  async removeByTrabajadorId(idTrabajador: string): Promise<void> {
    if (!idTrabajador) {
      return;
    }

    await this.trabajadorRegaloRepository.delete({ idTrabajador });
  }

  async count(): Promise<number> {
    return await this.trabajadorRegaloRepository.count();
  }

  async countByTrabajadorId(idTrabajador: string): Promise<number> {
    if (!idTrabajador) {
      return 0;
    }

    return await this.trabajadorRegaloRepository.count({ where: { idTrabajador } });
  }
}