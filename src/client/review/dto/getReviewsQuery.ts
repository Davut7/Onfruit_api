import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PageOptionsDto } from 'src/helpers/common/dto/page.dto';
import { GetReviewsEnum } from 'src/helpers/constants';

export class GetReviewsQuery extends PickType(PageOptionsDto, [
  'lng',
  'order',
  'take',
  'page',
] as const) {
  @IsEnum(GetReviewsEnum)
  @IsOptional()
  @ApiProperty({
    name: 'orderBy',
    enum: GetReviewsEnum,
    enumName: 'GetReviewsEnum',
  })
  orderBy: GetReviewsEnum;
}
