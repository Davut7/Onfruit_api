import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PageOptionsDto } from 'src/helpers/common/dto/page.dto';
import { GetClientProductsOrderEnum } from 'src/helpers/constants';
export class GetClientProducts extends PickType(PageOptionsDto, [
  'page',
  'take',
  'lng',
  'commodity',
  'search',
  'order',
] as const) {
  @ApiProperty({
    enum: GetClientProductsOrderEnum,
    enumName: 'GetClientProductsOrderEnum',
    required: false,
  })
  @IsEnum(GetClientProductsOrderEnum)
  @IsOptional()
  orderBy: GetClientProductsOrderEnum;
}
