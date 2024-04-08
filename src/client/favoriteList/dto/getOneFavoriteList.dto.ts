import { PickType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PageOptionsDto } from 'src/helpers/common/dto/page.dto';
import { GetOneFavoriteListOrderEnum } from 'src/helpers/constants';

export class GetOneFavoriteListFilter extends PickType(PageOptionsDto, [
  'page',
  'take',
  'lng',
  'commodity',
  'order',
] as const) {
  @IsEnum(GetOneFavoriteListOrderEnum)
  @IsOptional()
  orderBy: GetOneFavoriteListOrderEnum;
}
