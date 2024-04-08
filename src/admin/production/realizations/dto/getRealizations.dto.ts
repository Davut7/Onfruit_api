import { PickType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PageOptionsDto } from 'src/helpers/common/dto/page.dto';
import { RealizationOrderEnum } from 'src/helpers/constants';

export class GetRealizationsDto extends PickType(PageOptionsDto, [
  'page',
  'take',
  'order',
] as const) {
  @IsString()
  @IsOptional()
  search: string;

  @IsEnum(RealizationOrderEnum)
  @IsOptional()
  orderBy: RealizationOrderEnum;
}
