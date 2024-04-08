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
import { CreateFavoriteListDto } from './dto/createFavoriteList.dto';
import { GetOneFavoriteListFilter } from './dto/getOneFavoriteList.dto';
import { UpdateFavoriteListDto } from './dto/updateFavoriteList.dto';
import { UpdateFavoriteListProductDto } from './dto/updateFavoriteListProduct.dto';
import { FavoriteListEntity } from './entities/favoriteLists.entity';
import { FavoriteListProductsEntity } from './entities/favoriteListProducts.entity';
import { UserEntity } from '../user/users/entities/user.entity';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FavoriteListsService } from './favoriteLists.service';
import { ClientAuthGuard } from 'src/helpers/guards/clientAuthGuard.guard';
import { CurrentUser } from 'src/helpers/common/decorators/currentUser.decorator';

@ApiTags('favorite-lists')
@ApiBearerAuth()
@Controller('/client/favorite-lists')
export class FavoriteListsController {
  constructor(private readonly favoriteListsService: FavoriteListsService) {}

  @ApiOperation({ summary: 'Create a new favorite list' })
  @ApiCreatedResponse({
    description: 'Favorite list created successfully',
    type: FavoriteListEntity,
  })
  @ApiConflictResponse({
    description: 'Favorite list with the given title already exists',
  })
  @ApiBadRequestResponse({ description: 'Invalid request body' })
  @Post()
  @UseGuards(ClientAuthGuard)
  createFavoriteList(
    @Body() dto: CreateFavoriteListDto,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return this.favoriteListsService.createFavoriteList(dto, currentUser);
  }

  @ApiOperation({ summary: 'Get all favorite lists of the current user' })
  @ApiOkResponse({
    description: 'Favorite lists retrieved successfully',
    type: [FavoriteListEntity],
  })
  @Get()
  @UseGuards(ClientAuthGuard)
  getFavoriteLists(@CurrentUser() currentUser: UserEntity) {
    return this.favoriteListsService.getFavoriteLists(currentUser);
  }

  @ApiOperation({ summary: 'Get details of a specific favorite list' })
  @ApiOkResponse({
    description: 'Favorite list retrieved successfully',
    type: FavoriteListEntity,
  })
  @ApiNotFoundResponse({ description: 'Favorite list not found' })
  @ApiParam({
    name: 'id',
    description: 'Favorite list ID',
    type: String,
    example: '12345678-1234-1234-1234-123456789abc',
  })
  @ApiQuery({
    name: 'lng',
    description: 'Language code',
    required: false,
    example: 'en',
  })
  @Get(':id')
  @UseGuards(ClientAuthGuard)
  getOneFavoriteList(
    @Param('id', ParseUUIDPipe)
    favoriteListId: string,
    @Query()
    query: GetOneFavoriteListFilter,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return this.favoriteListsService.getOneFavoriteList(
      favoriteListId,
      query,
      currentUser,
    );
  }

  @ApiOperation({ summary: 'Update details of a specific favorite list' })
  @ApiOkResponse({
    description: 'Favorite list updated successfully',
    type: FavoriteListEntity,
  })
  @ApiNotFoundResponse({ description: 'Favorite list not found' })
  @ApiParam({
    name: 'id',
    description: 'Favorite list ID',
    type: String,
    example: '12345678-1234-1234-1234-123456789abc',
  })
  @Patch(':id')
  @UseGuards(ClientAuthGuard)
  updateFavoriteList(
    @Param('id', ParseUUIDPipe)
    favoriteListId: string,
    @Body() dto: UpdateFavoriteListDto,
  ) {
    return this.favoriteListsService.updateFavoriteList(favoriteListId, dto);
  }

  @ApiOperation({ summary: 'Delete a specific favorite list' })
  @ApiOkResponse({ description: 'Favorite list deleted successfully' })
  @ApiNotFoundResponse({ description: 'Favorite list not found' })
  @ApiParam({
    name: 'id',
    description: 'Favorite list ID',
    type: String,
    example: '12345678-1234-1234-1234-123456789abc',
  })
  @Delete(':id')
  @UseGuards(ClientAuthGuard)
  deleteFavoriteList(
    @Param('id', ParseUUIDPipe)
    favoriteListId: string,
  ) {
    return this.favoriteListsService.deleteFavoriteList(favoriteListId);
  }

  @ApiOperation({ summary: 'Add a product to a favorite list' })
  @ApiCreatedResponse({
    description: 'Product added successfully',
    type: FavoriteListProductsEntity,
  })
  @ApiNotFoundResponse({
    description: 'Product not found or already in favorite list',
  })
  @ApiParam({
    name: 'favoriteListId',
    description: 'Favorite list ID',
    type: String,
    example: '12345678-1234-1234-1234-123456789abc',
  })
  @ApiParam({
    name: 'productId',
    description: 'Product ID',
    type: String,
    example: '12345678-1234-1234-1234-123456789abc',
  })
  @Post(':favoriteListId/products/:productId')
  @UseGuards(ClientAuthGuard)
  addProductToFavoriteList(
    @Param('favoriteListId', ParseUUIDPipe)
    favoriteListId: string,

    @Param('productId', ParseUUIDPipe)
    productId: string,
  ) {
    return this.favoriteListsService.addProductToFavoriteList(
      favoriteListId,
      productId,
    );
  }

  @ApiOperation({ summary: 'Remove a product from a favorite list' })
  @ApiOkResponse({ description: 'Product removed successfully' })
  @ApiNotFoundResponse({ description: 'Favorite list product not found' })
  @ApiParam({
    name: 'favoriteListId',
    description: 'Favorite list product ID',
    type: String,
    example: '12345678-1234-1234-1234-123456789abc',
  })
  @Delete('/product/:favoriteListId')
  @UseGuards(ClientAuthGuard)
  removeProductFromFavoriteList(
    @Param('favoriteListId', ParseUUIDPipe)
    favoriteListId: string,
  ) {
    return this.favoriteListsService.removeProductFromFavoriteList(
      favoriteListId,
    );
  }

  @ApiOperation({ summary: 'Update a product in a favorite list' })
  @ApiOkResponse({
    description: 'Favorite list product updated successfully',
    type: FavoriteListProductsEntity,
  })
  @ApiNotFoundResponse({ description: 'Favorite list product not found' })
  @ApiParam({
    name: 'favoriteListId',
    description: 'Favorite list product ID',
    type: String,
    example: '12345678-1234-1234-1234-123456789abc',
  })
  @Patch('/product/:favoriteListId')
  @UseGuards(ClientAuthGuard)
  updateFavoriteListProduct(
    @Param('favoriteListId', ParseUUIDPipe)
    favoriteListId: string,
    @Body() dto: UpdateFavoriteListProductDto,
  ) {
    return this.favoriteListsService.updateFavoriteListProduct(
      favoriteListId,
      dto,
    );
  }
}
