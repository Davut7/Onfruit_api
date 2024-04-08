import { PartialType } from '@nestjs/swagger';
import { CreateRealizationPriceDto } from './createRealization.dto';

export class UpdateRealizationPriceDto extends PartialType(
  CreateRealizationPriceDto,
) {}
