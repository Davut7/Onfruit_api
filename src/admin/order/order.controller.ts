import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { GetOrders } from 'src/client/order/dto/getOrders.dto';
import { UpdateOrderDto } from './dto/updateOrder.dto';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { OrderEntity } from 'src/client/order/entities/order.entity';

@ApiTags('admin-orders')
@ApiBearerAuth()
@Controller('admin/order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @ApiOkResponse({
    description: 'Orders returned successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Orders retrieved successfully' },
        orders: { items: { $ref: getSchemaPath(OrderEntity) } },
        orderCount: { type: 'number' },
      },
    },
  })
  @Get()
  async getOrders(@Query() query: GetOrders) {
    return this.orderService.getOrders(query);
  }

  @ApiOkResponse({
    type: OrderEntity,
    description: 'Order returned successfully',
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Order not found',
  })
  @ApiParam({ name: 'id', description: 'Order id' })
  @Get(':id')
  async getOneOrder(@Param('id') orderId: string) {
    return this.orderService.getOneOrder(orderId);
  }

  @ApiOkResponse({
    description: 'Order deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Order deleted successfully' },
      },
    },
  })
  @ApiParam({ name: 'id', description: 'Order id' })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Order not found',
  })
  @Delete(':id')
  async deleteOrder(@Param('id') orderId: string) {
    return this.orderService.deleteOrder(orderId);
  }

  @ApiOkResponse({
    description: 'Order deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Order deleted successfully' },
        order: { $ref: getSchemaPath(OrderEntity) },
      },
    },
  })
  @ApiParam({ name: 'id', description: 'Order id' })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Order not found',
  })
  @Patch(':id')
  async updateOrder(@Param('id') orderId: string, @Body() dto: UpdateOrderDto) {
    return this.orderService.updateOrder(orderId, dto);
  }
}
