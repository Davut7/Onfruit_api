import { PickType } from '@nestjs/swagger';
import { DiscountEntity } from '../entities/discount.entity';

export class CreateDiscountDto extends PickType(DiscountEntity, [
  'discountPercent',
  'userType',
] as const) {}
