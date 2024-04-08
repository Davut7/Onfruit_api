import { PickType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PageOptionsDto } from 'src/helpers/common/dto/page.dto';
import { SubcategoryOrderEnum } from 'src/helpers/constants';

export class GetOneSubcategory extends PickType(PageOptionsDto, [
  'page',
  'take',
  'commodity',
  'search',
  'order',
] as const) {
  @IsString()
  @IsOptional()
  @IsEnum(SubcategoryOrderEnum)
  orderBy: SubcategoryOrderEnum;
}
