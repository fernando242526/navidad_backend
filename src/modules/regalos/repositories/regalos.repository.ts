import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like, In } from 'typeorm';
import { Regalo } from '../entities/regalo.entity';

@Injectable()
export class RegalosRepository {
  constructor(
    @InjectRepository(Regalo)
    private readonly regaloRepository: Repository<Regalo>,
  ) {}

  async create(createData: Partial<Regalo>): Promise<Regalo> {
    const regalo = this.regaloRepository.create(createData);
    return await this.regaloRepository.save(regalo);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{ regalos: Regalo[]; total: number }> {
    const validatedPage = page > 0 ? page : 1;
    const validatedLimit = limit > 0 ? limit : 10;

    const whereConditions: FindOptionsWhere<Regalo> = {};

    if (search !== undefined && search.trim() !== '') {
      whereConditions.codigoQr = Like(`%${search.trim()}%`);
    }

    const [regalos, total] = await this.regaloRepository.findAndCount({
      where: whereConditions,
      skip: (validatedPage - 1) * validatedLimit,
      take: validatedLimit,
      order: { createdAt: 'DESC' },
    });

    return { regalos, total };
  }

  async findOne(id: string): Promise<Regalo | null> {
    if (!id) {
      return null;
    }

    return await this.regaloRepository.findOne({
      where: { id },
    });
  }

  async findByCodigoQr(codigoQr: string): Promise<Regalo | null> {
    if (!codigoQr) {
      return null;
    }

    return await this.regaloRepository.findOne({
      where: { codigoQr },
    });
  }

  async findByIds(ids: string[]): Promise<Regalo[]> {
    if (!ids || ids.length === 0) {
      return [];
    }

    return await this.regaloRepository.find({
      where: { id: In(ids) },
    });
  }

  async update(id: string, updateData: Partial<Regalo>): Promise<Regalo | null> {
    if (!id) {
      return null;
    }

    await this.regaloRepository.update(id, updateData);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    if (!id) {
      return;
    }

    await this.regaloRepository.delete(id);
  }

  async count(): Promise<number> {
    return await this.regaloRepository.count();
  }
}