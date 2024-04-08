import { OmitType } from '@nestjs/swagger';
import { SubcategoryEntity } from '../entities/subcategory.entity';

export class CreateSubcategoryDto extends OmitType(SubcategoryEntity, [
  'id',
  'categoryId',
] as const) {}
