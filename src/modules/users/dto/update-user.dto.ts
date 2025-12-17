import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
import { APP_CONSTANTS } from '../../../common/constants/app.constants';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password'] as const)
) {}

export class UpdateUserPasswordDto {
  @IsNotEmpty()
  @IsString()
  currentPassword: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(APP_CONSTANTS.PASSWORD.MIN_LENGTH)
  @MaxLength(APP_CONSTANTS.PASSWORD.MAX_LENGTH)
  newPassword: string;
}