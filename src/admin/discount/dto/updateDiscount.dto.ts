import { PartialType, PickType } from '@nestjs/swagger';
import { CreateDiscountDto } from './createDiscount.dto';

export class UpdateDiscountDto extends PartialType(
  PickType(CreateDiscountDto, ['discountPercent'] as const),
) {}
