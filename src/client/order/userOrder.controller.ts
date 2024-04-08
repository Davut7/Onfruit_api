import {
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  Get,
  Query,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserOrderService } from './userOrder.service';
import { UserEntity } from '../user/users/entities/user.entity';
import { CurrentUser } from 'src/helpers/common/decorators/currentUser.decorator';
import { GetOrders } from './dto/getOrders.dto';
import { ClientAuthGuard } from 'src/helpers/guards/clientAuthGuard.guard';

@ApiTags('order')
@ApiBearerAuth()
@Controller('order')
export class UserOrderController {
  constructor(private readonly userOrderService: UserOrderService) {}

  @UseGuards(ClientAuthGuard)
  @ApiOperation({ summary: 'Order basket products' })
  @ApiParam({
    name: 'addressId',
    description: 'ID of the address to deliver the order',
    type: String,
  })
  @Post(':addressId')
  async orderBasketProducts(
    @CurrentUser() currentUser: UserEntity,
    @Param('addressId', ParseUUIDPipe) addressId: string,
  ) {
    return this.userOrderService.orderBasketProducts(currentUser, addressId);
  }

  @UseGuards(ClientAuthGuard)
  @ApiOperation({ summary: 'Get orders' })
  @Get()
  async getOrders(
    @CurrentUser() currentUser: UserEntity,
    @Query() query: GetOrders,
  ) {
    return this.userOrderService.getOrders(currentUser, query);
  }

  @UseGuards(ClientAuthGuard)
  @ApiOperation({ summary: 'Get one order by ID' })
  @ApiParam({
    name: 'orderId',
    description: 'ID of the order to retrieve',
    type: String,
  })
  @Get(':orderId')
  async getOneOrder(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return this.userOrderService.getOneOrder(orderId, currentUser);
  }

  @UseGuards(ClientAuthGuard)
  @ApiOperation({ summary: 'Delete an order by ID' })
  @ApiParam({
    name: 'orderId',
    description: 'ID of the order to delete',
    type: String,
  })
  @Delete(':orderId')
  async deleteOrder(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return this.userOrderService.deleteOrder(orderId, currentUser);
  }
}
