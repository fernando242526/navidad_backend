import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersRepository } from '../../modules/users/repositories/users.repository';
import { PasswordUtil } from '../../shared/utils/password.util';
import { ValidationUtil } from '../../shared/utils/validation.util';
import { UserRole } from '../../common/constants/roles.enum';

@Injectable()
export class AdminSeedService {
  private readonly logger = new Logger(AdminSeedService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly configService: ConfigService,
  ) {}

  async seedDefaultAdmin(): Promise<void> {
    try {
      // Verificar si ya existe algún admin
      const existingAdmins = await this.usersRepository.countByRole(UserRole.ADMIN);

      if (existingAdmins > 0) {
        this.logger.log('✅ Admin user already exists, skipping seed');
        return;
      }

      // Obtener datos del admin desde variables de entorno o usar valores por defecto
      const adminEmail = this.configService.get<string>('DEFAULT_ADMIN_EMAIL', 'admin@elpedregal.com');
      const adminPassword = this.configService.get<string>('DEFAULT_ADMIN_PASSWORD', 'Admin123!');
      const adminFirstName = this.configService.get<string>('DEFAULT_ADMIN_FIRST_NAME', 'Admin');
      const adminLastName = this.configService.get<string>('DEFAULT_ADMIN_LAST_NAME', 'El Pedregal');

      // Validar email
      if (!ValidationUtil.isValidEmail(adminEmail)) {
        throw new Error('Invalid admin email format in environment variables');
      }

      // Validar contraseña
      if (!ValidationUtil.isValidPassword(adminPassword)) {
        throw new Error(
          'Admin password does not meet security requirements (min 8 chars, uppercase, lowercase, number)',
        );
      }

      // Verificar si el email ya está en uso por otro usuario
      const existingUser = await this.usersRepository.findByEmail(adminEmail);
      if (existingUser) {
        this.logger.warn(`⚠️  User with email ${adminEmail} already exists but is not admin. Skipping admin creation.`);
        return;
      }

      // Crear admin por defecto
      const defaultAdminData = {
        firstName: ValidationUtil.sanitizeString(adminFirstName),
        lastName: ValidationUtil.sanitizeString(adminLastName),
        email: adminEmail.toLowerCase(),
        password: await PasswordUtil.hash(adminPassword),
        role: UserRole.ADMIN,
        isActive: true,
      };

      const adminUser = await this.usersRepository.create(defaultAdminData);

      this.logger.log('🎉 Default admin user created successfully');
      this.logger.log(`📧 Email: ${adminUser.email}`);
      this.logger.log(`🔑 Password: ${adminPassword}`);
      this.logger.log('⚠️  IMPORTANT: Please change the default password after first login');
      this.logger.log('🔒 For security, consider updating admin credentials via environment variables');
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error('❌ Failed to create default admin user:', error.message);
      } else {
        this.logger.error('❌ Failed to create default admin user:', String(error));
      }
      throw error;
    }
  }

  async createAdminIfNotExists(email: string, password: string, firstName: string, lastName: string): Promise<boolean> {
    try {
      // Verificar si el usuario ya existe
      const existingUser = await this.usersRepository.findByEmail(email);
      if (existingUser) {
        this.logger.log(`User with email ${email} already exists`);
        return false;
      }

      // Validaciones
      if (!ValidationUtil.isValidEmail(email)) {
        throw new Error('Invalid email format');
      }

      if (!ValidationUtil.isValidPassword(password)) {
        throw new Error('Password does not meet security requirements');
      }

      // Crear admin
      const adminData = {
        firstName: ValidationUtil.sanitizeString(firstName),
        lastName: ValidationUtil.sanitizeString(lastName),
        email: email.toLowerCase(),
        password: await PasswordUtil.hash(password),
        role: UserRole.ADMIN,
        isActive: true,
      };

      const adminUser = await this.usersRepository.create(adminData);
      this.logger.log(`✅ Admin user created: ${adminUser.email}`);
      return true;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`❌ Failed to create admin user: ${error.message}`);
      } else {
        this.logger.error(`❌ Failed to create admin user: ${String(error)}`);
      }
      throw error;
    }
  }

  async getAdminStats(): Promise<{
    totalAdmins: number;
    hasDefaultAdmin: boolean;
    defaultAdminEmail: string;
  }> {
    const totalAdmins = await this.usersRepository.countByRole(UserRole.ADMIN);
    const defaultAdminEmail = this.configService.get<string>('DEFAULT_ADMIN_EMAIL', 'admin@elpedregal.com');
    const defaultAdmin = await this.usersRepository.findByEmail(defaultAdminEmail);

    return {
      totalAdmins,
      hasDefaultAdmin: !!defaultAdmin,
      defaultAdminEmail,
    };
  }
}
