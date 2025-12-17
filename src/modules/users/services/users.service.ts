import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { UsersRepository } from '../repositories/users.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto, UpdateUserPasswordDto } from '../dto/update-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { PasswordUtil } from '../../../shared/utils/password.util';
import { ValidationUtil } from '../../../shared/utils/validation.util';
import { UserRole } from '../../../common/constants/roles.enum';
import { APP_CONSTANTS } from '../../../common/constants/app.constants';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Validar email
    if (!ValidationUtil.isValidEmail(createUserDto.email)) {
      throw new BadRequestException('Invalid email format');
    }

    // Validar contraseña
    if (!ValidationUtil.isValidPassword(createUserDto.password)) {
      throw new BadRequestException('Password must contain at least 8 characters, one uppercase, one lowercase, and one number');
    }

    // Verificar si el usuario ya existe
    const existingUser = await this.usersRepository.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hashear la contraseña
    const hashedPassword = await PasswordUtil.hash(createUserDto.password);

    // Crear el usuario
    const user = await this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return new UserResponseDto(user);
  }

  async findAll(
    page: number = APP_CONSTANTS.PAGINATION.DEFAULT_PAGE,
    limit: number = APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT,
    role?: UserRole,
    isActive?: boolean,
    search?: string,
  ): Promise<{ users: UserResponseDto[]; total: number }> {
    const validatedPage = page && page > 0 ? page : APP_CONSTANTS.PAGINATION.DEFAULT_PAGE;
    const validatedLimit = limit && limit > 0 ? Math.min(limit, APP_CONSTANTS.PAGINATION.MAX_LIMIT) : APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT;

    // Validar filtros si están presentes
    if (search && search.trim() === '') {
      throw new BadRequestException('Search filter cannot be empty');
    }

    const { users, total } = await this.usersRepository.findAll(
      validatedPage,
      validatedLimit,
      role,
      isActive,
      search,
    );

    const userResponseDtos = users.map(user => new UserResponseDto(user));

    return { users: userResponseDtos, total };
  }

  async findOne(id: string): Promise<UserResponseDto> {
    if (!id) {
      throw new BadRequestException('User ID is required');
    }

    const user = await this.usersRepository.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return new UserResponseDto(user);
  }

  async findByEmail(email: string): Promise<UserResponseDto | null> {
    if (!email) {
      return null;
    }

    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      return null;
    }

    return new UserResponseDto(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    if (!id) {
      throw new BadRequestException('User ID is required');
    }

    // Verificar si el usuario existe
    const existingUser = await this.usersRepository.findOne(id);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Si se actualiza el email, verificar que no esté en uso
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      if (!ValidationUtil.isValidEmail(updateUserDto.email)) {
        throw new BadRequestException('Invalid email format');
      }

      const emailExists = await this.usersRepository.findByEmail(updateUserDto.email);
      if (emailExists) {
        throw new ConflictException('Email already in use');
      }
    }

    const updatedUser = await this.usersRepository.update(id, updateUserDto);
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return new UserResponseDto(updatedUser);
  }

  async updatePassword(id: string, updatePasswordDto: UpdateUserPasswordDto): Promise<void> {
    if (!id) {
      throw new BadRequestException('User ID is required');
    }

    const user = await this.usersRepository.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verificar contraseña actual
    const isCurrentPasswordValid = await PasswordUtil.compare(
      updatePasswordDto.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Validar nueva contraseña
    if (!ValidationUtil.isValidPassword(updatePasswordDto.newPassword)) {
      throw new BadRequestException('New password must contain at least 8 characters, one uppercase, one lowercase, and one number');
    }

    // Hashear nueva contraseña
    const hashedPassword = await PasswordUtil.hash(updatePasswordDto.newPassword);

    // Actualizar contraseña
    await this.usersRepository.updatePassword(id, hashedPassword);
  }

  async remove(id: string): Promise<void> {
    if (!id) {
      throw new BadRequestException('User ID is required');
    }

    const user = await this.usersRepository.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.usersRepository.remove(id);
  }

  async softDelete(id: string): Promise<void> {
    if (!id) {
      throw new BadRequestException('User ID is required');
    }

    const user = await this.usersRepository.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.usersRepository.softDelete(id);
  }
}