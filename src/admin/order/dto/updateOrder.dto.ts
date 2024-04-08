import { PickType } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrderEntity } from 'src/client/order/entities/order.entity';
import { OrderStatus } from 'src/helpers/constants';

export class UpdateOrderDto extends PickType(OrderEntity, ['status'] as const) {
  @IsNotEmpty()
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
