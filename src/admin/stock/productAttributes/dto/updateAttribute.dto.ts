import { PartialType, PickType } from '@nestjs/swagger';
import { CreateProductAttrDto } from './createAttribute.dto';

export class UpdateProductAttrDto extends PartialType(
  PickType(CreateProductAttrDto, [
    'description',
    'title',
    'manufacturerCountry',
    'language',
  ] as const),
) {}
