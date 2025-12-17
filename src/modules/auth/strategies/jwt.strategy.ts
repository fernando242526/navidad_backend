import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AuthService } from '../services/auth.service';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { APP_CONSTANTS } from '../../../common/constants/app.constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');

    if (!jwtSecret) {
      throw new Error('JWT_SECRET is required');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          // Extraer del cookie (WEB)
          const token = request?.cookies?.[APP_CONSTANTS.JWT.ACCESS_TOKEN_COOKIE];
          if (token) {
            this.logger.debug('🍪 Token extracted from cookie (WEB)');
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });

    this.logger.log('✅ JWT Strategy initialized for WEB (cookies)');
  }

  async validate(payload: JwtPayload): Promise<UserResponseDto> {
    // Debug del payload
    this.logger.debug(`🔍 Validating JWT payload:`, {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      iat: payload.iat ? new Date(payload.iat * 1000).toISOString() : 'not set',
      exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'not set',
      timeLeft: payload.exp ? Math.max(0, payload.exp - Math.floor(Date.now() / 1000)) + 's' : 'unknown',
    });

    if (!payload || !payload.sub) {
      this.logger.error('❌ Invalid token payload - missing sub');
      throw new UnauthorizedException('Invalid token payload');
    }

    // Verificar si el token ha expirado manualmente (por si acaso)
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      this.logger.error(`❌ Token expired: ${new Date(payload.exp * 1000).toISOString()}`);
      throw new UnauthorizedException('Token expired');
    }

    const user = await this.authService.validateJwtPayload(payload);
    if (!user) {
      this.logger.error(`❌ User not found or inactive: ${payload.sub}`);
      throw new UnauthorizedException('User not found or inactive');
    }

    this.logger.debug(`✅ User validated: ${user.email} (${user.role})`);
    return user;
  }
}
