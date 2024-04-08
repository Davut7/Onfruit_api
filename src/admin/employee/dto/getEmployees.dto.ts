import { PickType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PageOptionsDto } from 'src/helpers/common/dto/page.dto';

export class GetEmployeesQuery extends PickType(PageOptionsDto, [
  'page',
  'take',
] as const) {
  @IsString()
  @IsOptional()
  search: string;
}
