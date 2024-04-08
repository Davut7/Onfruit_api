import { PartialType } from '@nestjs/swagger';
import { CreateRealizationDto } from './createRealization.dto';

export class UpdateRealizationDto extends PartialType(CreateRealizationDto) {}
