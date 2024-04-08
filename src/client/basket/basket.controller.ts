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
  ApiTags,
  getSchemaPath,
  ApiOperation,
} from '@nestjs/swagger';
import { BasketEntity } from './entities/basket.entity';

@ApiTags('basket')
@ApiBearerAuth()
@Controller('basket')
export class UserBasketController {
  constructor(private readonly userBasketService: UserBasketService) {}

  @ApiOperation({ summary: 'Add product to basket' })
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
  @Post(':productId')
  @UseGuards(ClientAuthGuard)
  addProductToBasket(
    @CurrentUser() currentUser: UserEntity,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.userBasketService.addProductToBasket(currentUser.id, productId);
  }

  @ApiOperation({ summary: 'Get basket products' })
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

  @ApiOperation({ summary: 'Remove basket item' })
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
  @Delete(':basketProductId')
  @UseGuards(ClientAuthGuard)
  removeBasketItem(
    @CurrentUser() currentUser: UserEntity,
    @Param('basketProductId', ParseUUIDPipe) basketProductId: string,
  ) {
    return this.userBasketService.removeProductFromBasket(
      currentUser.id,
      basketProductId,
    );
  }

  @ApiOperation({ summary: 'Update basket item' })
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
  @Patch(':basketProductId')
  @UseGuards(ClientAuthGuard)
  updateBasketProductData(
    @CurrentUser() currentUser: UserEntity,
    @Param('basketProductId', ParseUUIDPipe) basketProductId: string,
    @Body() dto: UpdateBasketProductDto,
  ) {
    return this.userBasketService.updateBasketProduct(
      basketProductId,
      dto,
      currentUser,
    );
  }
}
