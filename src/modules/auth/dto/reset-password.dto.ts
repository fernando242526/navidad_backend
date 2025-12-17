import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { APP_CONSTANTS } from '../../../common/constants/app.constants';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@example.com',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({
    description: 'Token de recuperación enviado al email',
    example: 'abc123def456',
  })
  @IsNotEmpty()
  @IsString()
  resetToken: string;

  @ApiProperty({
    description: 'Nueva contraseña',
    example: 'NewSecurePass123!',
    minLength: APP_CONSTANTS.PASSWORD.MIN_LENGTH,
    maxLength: APP_CONSTANTS.PASSWORD.MAX_LENGTH,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(APP_CONSTANTS.PASSWORD.MIN_LENGTH)
  @MaxLength(APP_CONSTANTS.PASSWORD.MAX_LENGTH)
  newPassword: string;
}