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
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
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
  @ApiCreatedResponse({
    description: 'Products ordered successfully',
  })
  @ApiBadRequestResponse({ description: 'Invalid request body' })
  @Post(':addressId')
  async orderBasketProducts(
    @CurrentUser() currentUser: UserEntity,
    @Param('addressId', ParseUUIDPipe) addressId: string,
  ) {
    return this.userOrderService.orderBasketProducts(currentUser, addressId);
  }
  @UseGuards(ClientAuthGuard)
  @ApiOperation({ summary: 'Order favorite list products' })
  @ApiCreatedResponse({
    description: 'Products ordered successfully',
  })
  @ApiBadRequestResponse({ description: 'Invalid request body' })
  @Post(':favoriteListId/favorite-list/:addressId')
  async orderFavoriteListProducts(
    @CurrentUser() currentUser: UserEntity,
    @Param('addressId', ParseUUIDPipe) addressId: string,
    @Param('favoriteListId', ParseUUIDPipe) favoriteListId: string,
  ) {
    return this.userOrderService.orderFavoriteListProducts(
      currentUser,
      favoriteListId,
      addressId,
    );
  }

  @UseGuards(ClientAuthGuard)
  @ApiOperation({ summary: 'Get orders' })
  @ApiOkResponse({
    description: 'Orders retrieved successfully',
  })
  @Get()
  async getOrders(
    @CurrentUser() currentUser: UserEntity,
    @Query() query: GetOrders,
  ) {
    return this.userOrderService.getOrders(currentUser, query);
  }

  @UseGuards(ClientAuthGuard)
  @ApiOperation({ summary: 'Get one order by ID' })
  @ApiOkResponse({
    description: 'Order returned successfully',
  })
  @ApiNotFoundResponse({ description: 'Order not found' })
  @Get(':orderId')
  async getOneOrder(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return this.userOrderService.getOneOrder(orderId, currentUser);
  }

  @UseGuards(ClientAuthGuard)
  @ApiOperation({ summary: 'Delete an order by ID' })
  @ApiOkResponse({
    description: 'Order deleted successfully',
  })
  @ApiNotFoundResponse({ description: 'Order not found' })
  @Delete(':orderId')
  async deleteOrder(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return this.userOrderService.deleteOrder(orderId, currentUser);
  }
}
