import { PartialType } from '@nestjs/swagger';
import { CreateSubcategoryDto } from './createSubcategory.dto';

export class UpdateSubcategoryDto extends PartialType(CreateSubcategoryDto) {}
