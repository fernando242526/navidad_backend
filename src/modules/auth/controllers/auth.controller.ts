import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
// Usar "import type" para tipos usados en decoradores
import type { Response } from 'express';
import { AuthService } from '../services/auth.service';
import { LoginDto, RegisterDto } from '../dto/auth.dto';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { BaseResponseDto } from '../../../common/dto/base-response.dto';
import { JwtAuthGuard } from '../../../common/guards/auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/constants/roles.enum';
import { APP_CONSTANTS } from '../../../common/constants/app.constants';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register a new user (Admin only)' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<BaseResponseDto<UserResponseDto>> {
    const result = await this.authService.register(registerDto);

    // NO establecer cookies - el admin debe mantener su sesión
    return new BaseResponseDto(
      result.user,
      'User registered successfully. User can now login with their credentials.',
      HttpStatus.CREATED,
    );
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<BaseResponseDto<UserResponseDto>> {
    const result = await this.authService.login(loginDto);

    // Establecer cookies HttpOnly para web
    this.setAuthCookies(response, result.accessToken, result.refreshToken);
    
    return new BaseResponseDto(result.user, 'User logged in successfully');
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(
    @Res({ passthrough: true }) response: Response,
  ): Promise<BaseResponseDto<null>> {
    // Obtener refresh token de la cookie
    const refreshToken = response.req.cookies[APP_CONSTANTS.JWT.REFRESH_TOKEN_COOKIE];

    // Validar que el refresh token existe
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const result = await this.authService.refreshToken(refreshToken);

    // Establecer nuevas cookies HttpOnly
    this.setAuthCookies(response, result.accessToken, result.refreshToken);
    
    return new BaseResponseDto(null, 'Token refreshed successfully');
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'User logged out successfully' })
  async logout(
    @CurrentUser('id') userId: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<BaseResponseDto<null>> {
    await this.authService.logout(userId);

    // Limpiar cookies
    this.clearAuthCookies(response);

    return new BaseResponseDto(null, 'User logged out successfully');
  }

  @Post('validate')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Validate current session' })
  @ApiResponse({ status: 200, description: 'Session is valid' })
  @ApiResponse({ status: 401, description: 'Invalid session' })
  async validateSession(
    @CurrentUser() user: UserResponseDto,
  ): Promise<BaseResponseDto<UserResponseDto>> {
    return new BaseResponseDto(user, 'Session is valid');
  }

  /**
   * 🔥 CONFIGURACIÓN CRÍTICA PARA COOKIES CROSS-DOMAIN
   * 
   * Cuando frontend y backend están en dominios diferentes:
   * - Backend: https://tu-api.onrender.com
   * - Frontend: https://tu-app.vercel.app
   * 
   * Es OBLIGATORIO usar:
   * - sameSite: 'none' (permite envío cross-domain)
   * - secure: true (requiere HTTPS)
   * - httpOnly: true (seguridad)
   * - path: '/' (disponible en todas las rutas)
   */
  private setAuthCookies(
    response: Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    const isProduction = process.env.NODE_ENV === 'production';

    // Configuración base de cookies
    const cookieConfig = {
      httpOnly: true, // No accesible desde JavaScript (seguridad XSS)
      secure: isProduction, // Solo HTTPS en producción
      sameSite: isProduction ? ('none' as const) : ('lax' as const), // 'none' permite cross-domain
      path: '/', // Disponible en todas las rutas
    };

    // Cookie para access token (24 horas)
    response.cookie(APP_CONSTANTS.JWT.ACCESS_TOKEN_COOKIE, accessToken, {
      ...cookieConfig,
      maxAge: 24 * 60 * 60 * 1000, // 24 horas en milisegundos
    });

    // Cookie para refresh token (7 días)
    response.cookie(APP_CONSTANTS.JWT.REFRESH_TOKEN_COOKIE, refreshToken, {
      ...cookieConfig,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días en milisegundos
    });
  }

  private clearAuthCookies(response: Response): void {
    const isProduction = process.env.NODE_ENV === 'production';

    const cookieConfig = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? ('none' as const) : ('lax' as const),
      path: '/',
    };

    response.clearCookie(APP_CONSTANTS.JWT.ACCESS_TOKEN_COOKIE, cookieConfig);
    response.clearCookie(APP_CONSTANTS.JWT.REFRESH_TOKEN_COOKIE, cookieConfig);
  }
}