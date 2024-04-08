import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PageOptionsDto } from 'src/helpers/common/dto/page.dto';
import { GetClientSubcategoryOrderEnum } from 'src/helpers/constants';

export class GetClientSubcategoryDto extends PickType(PageOptionsDto, [
  'page',
  'take',
  'commodity',
  'search',
  'lng',
  'order',
] as const) {
  @ApiProperty({
    enum: GetClientSubcategoryOrderEnum,
    enumName: 'GetClientSubcategoryOrderEnum',
    required: false,
  })
  @IsEnum(GetClientSubcategoryOrderEnum)
  @IsOptional()
  orderBy: GetClientSubcategoryOrderEnum;
}
