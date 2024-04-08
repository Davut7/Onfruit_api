import {
  LogLevelEnum,
  LogMethodEnum,
  LogsOrderEnum,
} from 'src/helpers/constants';
import { PageOptionsDto } from 'src/helpers/common/dto/page.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { PickType } from '@nestjs/swagger';

export class GetLogsFilter extends PickType(PageOptionsDto, [
  'page',
  'take',
  'order',
] as const) {
  @IsOptional()
  @IsEnum(LogMethodEnum)
  method: LogMethodEnum;

  @IsOptional()
  @IsEnum(LogLevelEnum)
  level: LogLevelEnum;

  //@IsOptional()
  //status: LogStatusEnum;

  @IsOptional()
  @IsEnum(LogsOrderEnum)
  orderBy: LogsOrderEnum;
}
