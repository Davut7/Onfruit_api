import { PickType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PageOptionsDto } from 'src/helpers/common/dto/page.dto';
import { RealizationOrderEnum } from 'src/helpers/constants';

export class GetOneRealizationDto extends PickType(PageOptionsDto, [
  'page',
  'take',
  'order',
] as const) {
  @IsEnum(RealizationOrderEnum)
  @IsOptional()
  orderBy: RealizationOrderEnum;
}
