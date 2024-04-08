import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { LikedProductsEntity } from './entities/likedProducts.entity';
import { GetLikedProductsDto } from './dto/getLikedProducts.dto';
import { UserEntity } from '../user/users/entities/user.entity';
import { LikedProductsService } from './likedProducts.service';
import { ClientAuthGuard } from 'src/helpers/guards/clientAuthGuard.guard';
import {
  ParseUUIDPipe,
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CurrentUser } from 'src/helpers/common/decorators/currentUser.decorator';

@ApiTags('liked-products')
@ApiBearerAuth()
@Controller('liked-products')
export class LikedProductsController {
  constructor(private readonly likedProductsService: LikedProductsService) {}

  @ApiOperation({ summary: 'Add a product to the liked list' })
  @ApiCreatedResponse({
    description: 'Product added to the liked list successfully',
    type: LikedProductsEntity,
  })
  @ApiNotFoundResponse({
    description: 'Product not found or already in the liked list',
  })
  @ApiBadRequestResponse({ description: 'Invalid request' })
  @Post('product/:productId')
  @ApiParam({
    name: 'productId',
    description: 'Product ID',
    type: String,
    example: '12345678-1234-1234-1234-123456789abc',
  })
  @UseGuards(ClientAuthGuard)
  createLikedProduct(
    @Param('productId', ParseUUIDPipe) productId: string,
    @CurrentUser() currentUser: UserEntity,
  ) {
    const userId = currentUser.id;
    return this.likedProductsService.createLikedProduct(userId, productId);
  }

  @ApiOperation({ summary: 'Get liked products of the current user' })
  @ApiOkResponse({
    description: 'Liked products returned successfully',
    type: [LikedProductsEntity],
  })
  @Get()
  @UseGuards(ClientAuthGuard)
  getLikedProducts(
    @CurrentUser() currentUser: UserEntity,
    @Query() query: GetLikedProductsDto,
  ) {
    return this.likedProductsService.getLikedProducts(currentUser, query);
  }

  @ApiOperation({ summary: 'Delete a liked product' })
  @ApiOkResponse({ description: 'Liked product deleted successfully' })
  @ApiNotFoundResponse({ description: 'Liked product not found' })
  @Delete('product/:likedProductId')
  @ApiParam({
    name: 'likedProductId',
    description: 'Liked Product ID',
    type: String,
    example: '12345678-1234-1234-1234-123456789abc',
  })
  @UseGuards(ClientAuthGuard)
  deleteLikedProducts(
    @Param('likedProductId', ParseUUIDPipe) likedProductId: string,
    @CurrentUser() currentUser: UserEntity,
  ) {
    const userId = currentUser.id;
    return this.likedProductsService.deleteLikedProduct(likedProductId, userId);
  }
}
