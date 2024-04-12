import {
  LogLevelEnum,
  LogMethodEnum,
  LogsOrderEnum,
  LogStatusEnum,
} from 'src/helpers/constants';
import { PageOptionsDto } from 'src/helpers/common/dto/page.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, PickType } from '@nestjs/swagger';

export class GetLogsFilter extends PickType(PageOptionsDto, [
  'page',
  'take',
  'order',
] as const) {
  @ApiProperty({
    title: 'Log method',
    name: 'method',
    enum: LogMethodEnum,
    enumName: 'LogMethodEnum',
    example: LogMethodEnum,
  })
  @IsOptional()
  @IsEnum(LogMethodEnum)
  method: LogMethodEnum;

  @ApiProperty({
    title: 'Log level',
    name: 'level',
    enum: LogLevelEnum,
    enumName: 'LogLevelEnum',
  })
  @IsOptional()
  @IsEnum(LogLevelEnum)
  level: LogLevelEnum;

  @ApiProperty({
    title: 'Log status',
    name: 'status',
    enum: LogStatusEnum,
    enumName: 'LogStatusEnum',
  })
  @IsOptional()
  status: LogStatusEnum;

  @ApiProperty({
    title: 'Log order by',
    name: 'orderBy',
    enum: LogsOrderEnum,
    enumName: 'LogsOrderEnum',
  })
  @IsOptional()
  @IsEnum(LogsOrderEnum)
  orderBy: LogsOrderEnum;
}
