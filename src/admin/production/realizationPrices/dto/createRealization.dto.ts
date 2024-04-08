import { PickType } from '@nestjs/swagger';
import { RealizationPriceEntity } from '../entities/realizationPrices.entity';

export class CreateRealizationPriceDto extends PickType(
  RealizationPriceEntity,
  ['quantity', 'price', 'userType'] as const,
) {}
