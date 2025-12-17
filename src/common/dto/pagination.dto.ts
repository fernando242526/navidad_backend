import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Max, Min } from 'class-validator';
import { APP_CONSTANTS } from '../constants/app.constants';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Min(1)
  page?: number = APP_CONSTANTS.PAGINATION.DEFAULT_PAGE;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Min(1)
  @Max(APP_CONSTANTS.PAGINATION.MAX_LIMIT)
  limit?: number = APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT;
}
