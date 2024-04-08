import { PickType } from '@nestjs/swagger';
import { ProductEntity } from '../entities/product.entity';

export class CreateProductDto extends PickType(ProductEntity, [
  'article',
  'barcode',
  'commodity',
] as const) {
  subcategoryId: string;
}
