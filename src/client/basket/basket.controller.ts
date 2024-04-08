import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserBasketService } from './basket.service';
import { ClientAuthGuard } from '../../helpers/guards/clientAuthGuard.guard';
import { UserEntity } from '../user/users/entities/user.entity';
import { UpdateBasketProductDto } from './dto/updateBasket.dto';
import { CurrentUser } from 'src/helpers/common/decorators/currentUser.decorator';
import { GetBasketProducts } from './dto/getBasketProducts.dto';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { BasketEntity } from './entities/basket.entity';

@ApiTags('basket')
@ApiBearerAuth()
@Controller('basket')
export class UserBasketController {
  constructor(private readonly userBasketService: UserBasketService) {}

  @ApiParam({ name: 'id', type: 'string', description: 'Product id' })
  @ApiConflictResponse({
    type: ConflictException,
    description: 'Product with id already exists in basket!',
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Product with id not found',
  })
  @ApiOkResponse({
    description: 'Product added to basket successfully',
    schema: {
      type: 'object',
      properties: {
        basketProduct: { $ref: getSchemaPath(BasketEntity) },
        message: {
          type: 'string',
          example: 'Product added to basket successfully!',
        },
      },
    },
  })
  @Post(':id')
  @UseGuards(ClientAuthGuard)
  addProductToBasket(
    @CurrentUser() currentUser: UserEntity,
    @Param('id', ParseUUIDPipe) productId: string,
  ) {
    return this.userBasketService.addProductToBasket(currentUser.id, productId);
  }

  @ApiOkResponse({
    description: 'Basket product added successfully',
    schema: {
      type: 'object',
      properties: {
        basketProducts: { items: { $ref: getSchemaPath(BasketEntity) } },
        basketProductCount: { type: 'integer' },
        message: {
          example: 'Basket products retrieved successfully!',
          type: 'string',
        },
      },
    },
  })
  @Get('')
  @UseGuards(ClientAuthGuard)
  getBasketProducts(
    @CurrentUser() currentUser: UserEntity,
    @Query() query: GetBasketProducts,
  ) {
    return this.userBasketService.getBasketProductList(currentUser, query);
  }

  @ApiParam({ type: 'string', name: 'id', description: 'Basket product id' })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Basket product not found',
  })
  @ApiOkResponse({
    description: 'Basket item deleted successfully!',
    schema: {
      type: 'object',
      properties: {
        message: {
          example: 'Basket item deleted successfully!',
          type: 'string',
        },
      },
    },
  })
  @Delete(':id')
  @UseGuards(ClientAuthGuard)
  removeBasketItem(
    @CurrentUser() currentUser: UserEntity,
    @Param('id', ParseUUIDPipe) basketProductId: string,
  ) {
    return this.userBasketService.removeProductFromBasket(
      currentUser.id,
      basketProductId,
    );
  }
  @ApiParam({ type: 'string', name: 'id', description: 'Basket product id' })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Basket product not found',
  })
  @ApiOkResponse({
    description: 'Basket item updated successfully!',
    schema: {
      type: 'object',
      properties: {
        message: {
          example: 'Basket item updated successfully!',
          type: 'string',
        },
        basketProduct: { $ref: getSchemaPath(BasketEntity) },
      },
    },
  })
  @ApiConflictResponse({
    type: ConflictException,
    description: 'Basket product quantity cannot be less than 1',
  })
  @Patch(':id')
  @UseGuards(ClientAuthGuard)
  updateBasketProductData(
    @CurrentUser() currentUser: UserEntity,
    @Param('id', ParseUUIDPipe) basketProductId: string,
    @Body() dto: UpdateBasketProductDto,
  ) {
    return this.userBasketService.updateBasketProduct(
      basketProductId,
      dto,
      currentUser,
    );
  }
}
