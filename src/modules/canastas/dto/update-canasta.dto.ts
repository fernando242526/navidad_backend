import { PartialType } from '@nestjs/mapped-types';
import { CreateCanastaDto } from './create-canasta.dto';

export class UpdateCanastaDto extends PartialType(CreateCanastaDto) {}