import { Controller, Get } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOkResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { OrderEntity } from 'src/client/order/entities/order.entity';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @ApiOkResponse({
    description: 'Returns completed orders and their count.',
    schema: {
      type: 'object',
      properties: {
        orders: {
          type: 'array',
          items: { $ref: getSchemaPath(OrderEntity) },
        },
        orderCount: { type: 'number' },
      },
    },
  })
  @Get('completed-orders')
  async getCompletedOrdersAndCount() {
    return this.analyticsService.getCompletedOrdersAndCount();
  }

  @ApiOkResponse({
    description: 'Returns registered users.',
    schema: {
      type: 'object',
      properties: {
        role: {
          type: 'string',
        },
        usersCount: { type: 'number' },
      },
    },
  })
  @Get('registered-users')
  async getRegisteredUsers() {
    return this.analyticsService.getRegisteredUsers();
  }

  @ApiOkResponse({
    description: 'Returns registered users today.',
    schema: {
      type: 'object',
      properties: {
        usersCount: { type: 'number' },
      },
    },
  })
  @Get('registered-users-today')
  async getRegisteredUsersToday() {
    return this.analyticsService.getRegisteredUsersToday();
  }

  @ApiOkResponse({
    description: 'Returns sold products weight.',
    schema: {
      type: 'object',
      properties: {
        soldProductsWeight: {
          type: 'number',
        },
      },
    },
  })
  @Get('sold-products-weight')
  async getSoldProductsWeight() {
    return this.analyticsService.getSoldProductsWeight();
  }

  @ApiOkResponse({ description: 'Returns recent orders.', type: [OrderEntity] })
  @Get('recent-orders')
  async getRecentOrders() {
    return this.analyticsService.getRecentOrders();
  }

  @ApiOkResponse({
    description: 'Returns top sold products.',
    type: [OrderEntity],
  })
  @Get('top-sold-products')
  async getTopSoldProducts() {
    return this.analyticsService.getTopSoldProducts();
  }

  @ApiOkResponse({
    description: 'Returns top not sold products.',
    type: [OrderEntity],
  })
  @Get('top-not-sold-products')
  async getTopNotSoldProducts() {
    return this.analyticsService.getTopNotSoldProducts();
  }

  @ApiOkResponse({
    description: 'Returns monthly orders.',
    schema: {
      type: 'object',
      properties: {
        orders: {
          $ref: getSchemaPath(OrderEntity),
        },
        ordersCount: { type: 'number' },
      },
    },
  })
  @Get('get-monthly-orders')
  async getGetMonthlyOrders() {
    return this.analyticsService.getMonthOrders();
  }
}
