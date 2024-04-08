import { OmitType } from '@nestjs/swagger';
import { OrderProductsEntity } from '../entities/orderProducts.entity';

export class OrderedProductDto extends OmitType(OrderProductsEntity, [
  'id',
  'productQuantity',
  'productSum',
] as const) {}
