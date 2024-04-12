import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOkResponse,
  getSchemaPath,
  ApiOperation,
} from '@nestjs/swagger';
import { OrderEntity } from 'src/client/order/entities/order.entity';
import { AbilitiesGuard } from 'src/helpers/guards/abilities.guard';
import { ActionEnum, SubjectEnum } from 'src/helpers/constants';
import { CheckAbilities } from 'src/helpers/common/decorators/abilityDecorator.decorator';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(AbilitiesGuard)
@Controller('/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @ApiOperation({ summary: 'Get completed orders and their count' })
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
  @CheckAbilities({
    action: ActionEnum.Read,
    subject: SubjectEnum.Analytics,
  })
  @Get('completed-orders')
  async getCompletedOrdersAndCount() {
    return this.analyticsService.getCompletedOrdersAndCount();
  }

  @ApiOperation({ summary: 'Get registered users' })
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
  @CheckAbilities({
    action: ActionEnum.Read,
    subject: SubjectEnum.Analytics,
  })
  @Get('registered-users')
  async getRegisteredUsers() {
    return this.analyticsService.getRegisteredUsers();
  }

  @ApiOperation({ summary: 'Get registered users today' })
  @ApiOkResponse({
    description: 'Returns registered users today.',
    schema: {
      type: 'object',
      properties: {
        usersCount: { type: 'number' },
      },
    },
  })
  @CheckAbilities({
    action: ActionEnum.Read,
    subject: SubjectEnum.Analytics,
  })
  @Get('registered-users-today')
  async getRegisteredUsersToday() {
    return this.analyticsService.getRegisteredUsersToday();
  }

  @ApiOperation({ summary: 'Get sold products weight' })
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
  @CheckAbilities({
    action: ActionEnum.Read,
    subject: SubjectEnum.Analytics,
  })
  @Get('sold-products-weight')
  async getSoldProductsWeight() {
    return this.analyticsService.getSoldProductsWeight();
  }

  @ApiOperation({ summary: 'Get recent orders' })
  @ApiOkResponse({ description: 'Returns recent orders.', type: [OrderEntity] })
  @CheckAbilities({
    action: ActionEnum.Read,
    subject: SubjectEnum.Analytics,
  })
  @Get('recent-orders')
  async getRecentOrders() {
    return this.analyticsService.getRecentOrders();
  }

  @ApiOperation({ summary: 'Get top sold products' })
  @ApiOkResponse({
    description: 'Returns top sold products.',
    type: [OrderEntity],
  })
  @CheckAbilities({
    action: ActionEnum.Read,
    subject: SubjectEnum.Analytics,
  })
  @Get('top-sold-products')
  async getTopSoldProducts() {
    return this.analyticsService.getTopSoldProducts();
  }

  @ApiOperation({ summary: 'Get top not sold products' })
  @ApiOkResponse({
    description: 'Returns top not sold products.',
    type: [OrderEntity],
  })
  @CheckAbilities({
    action: ActionEnum.Read,
    subject: SubjectEnum.Analytics,
  })
  @Get('top-not-sold-products')
  async getTopNotSoldProducts() {
    return this.analyticsService.getTopNotSoldProducts();
  }

  @ApiOperation({ summary: 'Get monthly orders' })
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
  @CheckAbilities({
    action: ActionEnum.Read,
    subject: SubjectEnum.Analytics,
  })
  @Get('get-monthly-orders')
  async getGetMonthlyOrders() {
    return this.analyticsService.getMonthOrders();
  }
}
