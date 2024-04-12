import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { UserEntity } from 'src/client/user/users/entities/user.entity';
import { CurrentUser } from 'src/helpers/common/decorators/currentUser.decorator';
import { GetClientSubcategoryDto } from '../subcategory/dto/getSubcategory.dto';
import { ClientCategoryService } from './clientCategory.service';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';

@ApiTags('client-category')
@Controller('client/category')
export class ClientCategoryController {
  constructor(private readonly clientCategoryService: ClientCategoryService) {}

  @ApiOperation({ summary: 'Get all categories' })
  @ApiOkResponse({ description: 'Categories returned successfully' })
  @Get()
  getCategories() {
    return this.clientCategoryService.getCategories();
  }

  @ApiOperation({ summary: 'Get one category with subcategories' })
  @ApiOkResponse({ description: 'Category returned successfully' })
  @ApiCreatedResponse({
    type: NotFoundException,
    description: 'Category not found',
  })
  @Get(':categoryId')
  getOneCategory(
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
    @CurrentUser() currentUser: UserEntity,
    @Query() query: GetClientSubcategoryDto,
  ) {
    return this.clientCategoryService.getOneCategory(
      categoryId,
      query,
      currentUser,
    );
  }
}
