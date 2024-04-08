import { PickType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PageOptionsDto } from 'src/helpers/common/dto/page.dto';
import { GetArrivalsOrderEnum } from 'src/helpers/constants';

export class GetArrivalsDto extends PickType(PageOptionsDto, [
  'page',
  'take',
  'order',
] as const) {
  @IsString()
  @IsOptional()
  search: string;

  @IsOptional()
  @IsEnum(GetArrivalsOrderEnum)
  orderBy: GetArrivalsOrderEnum;
}
