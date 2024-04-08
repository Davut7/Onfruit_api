import { PickType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PageOptionsDto } from 'src/helpers/common/dto/page.dto';
import { GetArrivalByProductOrderEnum } from 'src/helpers/constants';

export class GetOneArrivalDto extends PickType(PageOptionsDto, [
  'page',
  'take',
  'order',
] as const) {
  @IsOptional()
  @IsEnum(GetArrivalByProductOrderEnum)
  orderBy: GetArrivalByProductOrderEnum;
}
