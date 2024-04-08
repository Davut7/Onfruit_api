import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { UserEntity } from 'src/client/user/users/entities/user.entity';
import { CurrentUser } from 'src/helpers/common/decorators/currentUser.decorator';
import { GetClientSubcategoryDto } from '../subcategory/dto/getSubcategory.dto';
import { ClientCategoryService } from './clientCategory.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Client Category')
@Controller('client/category')
export class ClientCategoryController {
  constructor(private readonly clientCategoryService: ClientCategoryService) {}

  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ status: 200, description: 'Categories returned successfully' })
  @Get()
  getCategories() {
    return this.clientCategoryService.getCategories();
  }

  @ApiOperation({ summary: 'Get one category with subcategories' })
  @ApiResponse({ status: 200, description: 'Category returned successfully' })
  @ApiResponse({ status: 400, description: 'Category not found' })
  @ApiParam({ name: 'id', description: 'Category ID', type: String })
  @Get(':id')
  getOneCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: UserEntity,
    @Query() query: GetClientSubcategoryDto,
  ) {
    return this.clientCategoryService.getOneCategory(id, query, currentUser);
  }
}
