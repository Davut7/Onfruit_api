import { PickType } from '@nestjs/swagger';
import { ProductAttributesEntity } from '../entities/productAttributes.entity';

export class CreateProductAttrDto extends PickType(ProductAttributesEntity, [
  'id',
  'language',
  'manufacturerCountry',
  'description',
  'title',
] as const) {}
