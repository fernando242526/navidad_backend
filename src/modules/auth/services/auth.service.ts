import { Injectable, UnauthorizedException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersRepository } from '../../users/repositories/users.repository';
import { LoginDto, RegisterDto } from '../dto/auth.dto';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { PasswordUtil } from '../../../shared/utils/password.util';
import { ValidationUtil } from '../../../shared/utils/validation.util';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import { getJwtConfig } from '../../../config/jwt.config';

export interface AuthResponse {
  user: UserResponseDto;
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly jwtConfig;
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.jwtConfig = getJwtConfig(this.configService);
  }

  async validateUser(email: string, password: string): Promise<UserResponseDto | null> {
    if (!email || !password) {
      return null;
    }

    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      return null;
    }

    if (!user.isActive) {
      return null;
    }

    const isPasswordValid = await PasswordUtil.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return new UserResponseDto(user);
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);

    // Actualizar refresh token y último login
    await this.usersRepository.updateRefreshToken(user.id, tokens.refreshToken);
    await this.usersRepository.updateLastLogin(user.id);

    return {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { firstName, lastName, email, password, role } = registerDto;

    // Validaciones
    await this.validateRegistrationData(email, password);

    // Hashear la contraseña
    const hashedPassword = await PasswordUtil.hash(password);

    const userData = {
      firstName: ValidationUtil.sanitizeString(firstName),
      lastName: ValidationUtil.sanitizeString(lastName),
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      isActive: true,
    };

    const user = await this.usersRepository.create(userData);

    // Generar tokens
    const userResponse = new UserResponseDto(user);
    const tokens = await this.generateTokens(userResponse);

    // Actualizar refresh token y último login
    await this.usersRepository.updateRefreshToken(user.id, tokens.refreshToken);
    await this.usersRepository.updateLastLogin(user.id);

    return {
      user: userResponse,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.jwtConfig.refreshSecret,
      }) as JwtPayload;

      const user = await this.usersRepository.findOne(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      // Verificar que el refresh token coincida
      if (user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newPayload: JwtPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      const newAccessToken = this.jwtService.sign(newPayload, {
        secret: this.jwtConfig.secret,
        expiresIn: this.jwtConfig.expiresIn,
      });

      const newRefreshToken = this.jwtService.sign(newPayload, {
        secret: this.jwtConfig.refreshSecret,
        expiresIn: this.jwtConfig.refreshExpiresIn,
      });

      // Actualizar refresh token en la base de datos
      await this.usersRepository.updateRefreshToken(user.id, newRefreshToken);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    if (!userId) {
      return;
    }

    // Remover refresh token de la base de datos
    await this.usersRepository.updateRefreshToken(userId, null);
  }

  async validateJwtPayload(
    payload: JwtPayload,
  ): Promise<UserResponseDto | null> {
    if (!payload || !payload.sub) {
      return null;
    }

    const user = await this.usersRepository.findOne(payload.sub);
    if (!user || !user.isActive) {
      return null;
    }

    return new UserResponseDto(user);
  }

  private async validateRegistrationData(
    email: string,
    password: string,
  ): Promise<void> {
    // Validar email
    if (!ValidationUtil.isValidEmail(email)) {
      throw new BadRequestException('Invalid email format');
    }

    // Validar contraseña
    if (!ValidationUtil.isValidPassword(password)) {
      throw new BadRequestException(
        'Password must contain at least 8 characters, one uppercase, one lowercase, and one number',
      );
    }

    // Verificar si el usuario ya existe
    const existingUser = await this.usersRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }
  }

  private async generateTokens(
    user: UserResponseDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const now = Math.floor(Date.now() / 1000);
    const accessTokenExp = now + this.jwtConfig.expiresIn;
    const refreshTokenExp = now + this.jwtConfig.refreshExpiresIn;

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    // Debug: Log de configuración
    this.logger.log(`🔧 Token Generation Config:`);
    this.logger.log(`Current time: ${new Date(now * 1000).toISOString()}`);
    this.logger.log(`Access token expires in: ${this.jwtConfig.expiresIn} seconds`);
    this.logger.log(
      `Access token will expire at: ${new Date(accessTokenExp * 1000).toISOString()}`,
    );
    this.logger.log(
      `Refresh token expires in: ${this.jwtConfig.refreshExpiresIn} seconds`,
    );
    this.logger.log(
      `Refresh token will expire at: ${new Date(refreshTokenExp * 1000).toISOString()}`,
    );

    try {
      const accessToken = this.jwtService.sign(payload, {
        secret: this.jwtConfig.secret,
        expiresIn: this.jwtConfig.expiresIn,
      });

      const refreshToken = this.jwtService.sign(payload, {
        secret: this.jwtConfig.refreshSecret,
        expiresIn: this.jwtConfig.refreshExpiresIn,
      });

      // Verificar que los tokens se generaron correctamente
      try {
        const decodedAccess = this.jwtService.decode(accessToken) as JwtPayload;
        const decodedRefresh = this.jwtService.decode(refreshToken) as JwtPayload;

        if (decodedAccess?.exp) {
          this.logger.log(
            `✅ Access token generated - expires: ${new Date(decodedAccess.exp * 1000).toISOString()}`,
          );
        }
        if (decodedRefresh?.exp) {
          this.logger.log(
            `✅ Refresh token generated - expires: ${new Date(decodedRefresh.exp * 1000).toISOString()}`,
          );
        }
      } catch (decodeError) {
        this.logger.error(`❌ Error decoding generated tokens:`, decodeError);
      }

      return { accessToken, refreshToken };
    } catch (error) {
      this.logger.error(`❌ Error generating tokens:`, error);
      throw error;
    }
  }
}