import { PickType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PageOptionsDto } from 'src/helpers/common/dto/page.dto';
import { GetProductsOrderEnum } from 'src/helpers/constants';

export class GetProductsDto extends PickType(PageOptionsDto, [
  'page',
  'take',
  'commodity',
  'search',
  'order',
] as const) {
  @IsEnum(GetProductsOrderEnum)
  @IsOptional()
  orderBy: GetProductsOrderEnum;
}
