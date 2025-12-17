import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsEnum } from 'class-validator';
import { APP_CONSTANTS } from '../../../common/constants/app.constants';
import { UserRole } from '../../../common/constants/roles.enum';

export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(APP_CONSTANTS.PASSWORD.MIN_LENGTH)
  @MaxLength(APP_CONSTANTS.PASSWORD.MAX_LENGTH)
  password: string;
}

// DTO para registro (solo admin puede registrar usuarios)
export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(APP_CONSTANTS.PASSWORD.MIN_LENGTH)
  @MaxLength(APP_CONSTANTS.PASSWORD.MAX_LENGTH)
  password: string;

  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;
}

export class RefreshTokenDto {
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
