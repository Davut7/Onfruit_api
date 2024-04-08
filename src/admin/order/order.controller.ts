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
  ApiTags,
  getSchemaPath,
  ApiOperation,
} from '@nestjs/swagger';
import { OrderEntity } from 'src/client/order/entities/order.entity';

@ApiTags('admin-orders')
@ApiBearerAuth()
@Controller('admin/order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @ApiOperation({ summary: 'Get orders' })
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

  @ApiOperation({ summary: 'Get one order by ID' })
  @ApiOkResponse({
    type: OrderEntity,
    description: 'Order returned successfully',
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Order not found',
  })
  @Get(':orderId')
  async getOneOrder(@Param('orderId') orderId: string) {
    return this.orderService.getOneOrder(orderId);
  }

  @ApiOperation({ summary: 'Delete an order by ID' })
  @ApiOkResponse({
    description: 'Order deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Order deleted successfully' },
      },
    },
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Order not found',
  })
  @Delete(':orderId')
  async deleteOrder(@Param('orderId') orderId: string) {
    return this.orderService.deleteOrder(orderId);
  }

  @ApiOperation({ summary: 'Update an order by ID' })
  @ApiOkResponse({
    description: 'Order updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Order updated successfully' },
        order: { $ref: getSchemaPath(OrderEntity) },
      },
    },
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Order not found',
  })
  @Patch(':orderId')
  async updateOrder(
    @Param('orderId') orderId: string,
    @Body() dto: UpdateOrderDto,
  ) {
    return this.orderService.updateOrder(orderId, dto);
  }
}
