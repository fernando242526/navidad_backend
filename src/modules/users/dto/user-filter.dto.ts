import { IsOptional, IsBoolean, IsEnum, IsString, MaxLength, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { UserRole } from '../../../common/constants/roles.enum';
import { BooleanTransform } from '../../../common/decorators/boolean-transform.decorator';

export class UserFilterDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by user role',
    enum: UserRole,
    example: UserRole.ADMIN
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  @BooleanTransform()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Search by user name or email',
    example: 'john',
    maxLength: 255
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  search?: string;
}