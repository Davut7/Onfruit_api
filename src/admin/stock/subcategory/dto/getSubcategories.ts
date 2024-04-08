import { PickType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PageOptionsDto } from 'src/helpers/common/dto/page.dto';
import { OrderType } from 'src/helpers/constants';

export class GetSubcategoriesDto extends PickType(PageOptionsDto, [
  'page',
  'take',
] as const) {
  @IsString()
  @IsOptional()
  search: string;

  @IsString()
  @IsOptional()
  @IsEnum(OrderType)
  sort: OrderType;
}
