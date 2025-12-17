import { PartialType } from '@nestjs/mapped-types';
import { CreateRegaloDto } from './create-regalo.dto';

export class UpdateRegaloDto extends PartialType(CreateRegaloDto) {}