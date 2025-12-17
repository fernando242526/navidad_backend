import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength, MaxLength, IsOptional, IsBoolean } from 'class-validator';
import { UserRole } from '../../../common/constants/roles.enum';
import { APP_CONSTANTS } from '../../../common/constants/app.constants';

export class CreateUserDto {
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

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole = UserRole.ASISTENTE_VENTANILLA;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}