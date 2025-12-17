import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserRole } from '../../../common/constants/roles.enum';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: Partial<User>): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    role?: UserRole,
    isActive?: boolean,
    search?: string,
  ): Promise<{ users: User[]; total: number }> {
    const validatedPage = page > 0 ? page : 1;
    const validatedLimit = limit > 0 ? limit : 10;
    
    const whereConditions: FindOptionsWhere<User> = {};
    
    if (role !== undefined) {
      whereConditions.role = role;
    }
    
    if (isActive !== undefined) {
      whereConditions.isActive = isActive;
    }

    if (search !== undefined && search.trim() !== '') {
      whereConditions.firstName = Like(`%${search.trim()}%`);
    }

    const [users, total] = await this.userRepository.findAndCount({
      where: whereConditions,
      skip: (validatedPage - 1) * validatedLimit,
      take: validatedLimit,
      order: { createdAt: 'DESC' },
    });

    return { users, total };
  }

  async findOne(id: string): Promise<User | null> {
    if (!id) {
      return null;
    }
    
    return await this.userRepository.findOne({ 
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    if (!email) {
      return null;
    }
    
    return await this.userRepository.findOne({ 
      where: { email },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    if (!id) {
      return null;
    }
    
    await this.userRepository.update(id, updateUserDto);
    return await this.findOne(id);
  }

  async updateRefreshToken(id: string, refreshToken: string | null): Promise<void> {
    if (!id) {
      return;
    }
    
    await this.userRepository.update(id, { refreshToken });
  }

  async updateLastLogin(id: string): Promise<void> {
    if (!id) {
      return;
    }
    
    await this.userRepository.update(id, { lastLogin: new Date() });
  }

  async remove(id: string): Promise<void> {
    if (!id) {
      return;
    }
    
    await this.userRepository.delete(id);
  }

  async softDelete(id: string): Promise<void> {
    if (!id) {
      return;
    }
    
    await this.userRepository.update(id, { isActive: false });
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    if (!id || !hashedPassword) {
      return;
    }
    
    await this.userRepository.update(id, { password: hashedPassword });
  }

  async count(): Promise<number> {
    return await this.userRepository.count();
  }

  async countByRole(role: UserRole): Promise<number> {
    return await this.userRepository.count({ where: { role } });
  }
}