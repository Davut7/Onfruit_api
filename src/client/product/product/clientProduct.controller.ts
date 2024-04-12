import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserEntity } from 'src/client/user/users/entities/user.entity';
import { ClientAuthGuard } from 'src/helpers/guards/clientAuthGuard.guard';
import { CurrentUser } from 'src/helpers/common/decorators/currentUser.decorator';
import { ClientProductService } from './clientProduct.service';
import { GetClientProducts } from './dto/getProducts.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('client-products')
@Controller('client/products')
export class ClientProductController {
  constructor(private readonly clientProductService: ClientProductService) {}

  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'Products returned successfully' })
  @ApiQuery({ name: 'commodity', required: false, type: String })
  @Get()
  async getProducts(@Query() query: GetClientProducts) {
    return await this.clientProductService.getProducts(query);
  }

  @ApiOperation({ summary: 'Get all products with authentication' })
  @ApiResponse({ status: 200, description: 'Products returned successfully' })
  @UseGuards(ClientAuthGuard)
  @ApiQuery({ name: 'commodity', required: false, type: String })
  @Get('authenticated')
  async getProductsWithAuth(
    @Query() query: GetClientProducts,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return await this.clientProductService.getProducts(query, currentUser);
  }

  @ApiOperation({ summary: 'Get one product' })
  @ApiResponse({ status: 200, description: 'Product returned successfully' })
  @ApiResponse({ status: 400, description: 'Product not found' })
  @ApiParam({ name: 'id', description: 'Product ID', type: String })
  @Get(':id')
  async getOneProduct(
    @Query() query: GetClientProducts,
    @CurrentUser() currentUser: UserEntity,
    @Param('id', ParseUUIDPipe) productId: string,
  ) {
    return await this.clientProductService.getOneProduct(
      productId,
      query,
      currentUser,
    );
  }
}
