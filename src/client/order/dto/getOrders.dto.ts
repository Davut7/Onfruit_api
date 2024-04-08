import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PageOptionsDto } from 'src/helpers/common/dto/page.dto';
import { GetOrdersEnum, OrderStatus } from 'src/helpers/constants';

export class GetOrders extends PickType(PageOptionsDto, [
  'order',
  'page',
  'take',
] as const) {
  @ApiProperty({
    enum: GetOrdersEnum,
    enumName: 'GetOrdersEnum',
    required: false,
  })
  @IsEnum(GetOrdersEnum)
  @IsOptional()
  orderBy: GetOrdersEnum;

  @ApiProperty({ enum: OrderStatus, enumName: 'OrderStatus', required: false })
  @IsEnum(OrderStatus)
  @IsOptional()
  status: OrderStatus;
}
