import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClientSubcategoryService } from './clientSubcategory.service';
import { GetClientSubcategoryDto } from './dto/getSubcategory.dto';
import { ClientAuthGuard } from 'src/helpers/guards/clientAuthGuard.guard';
import { UserEntity } from 'src/client/user/users/entities/user.entity';
import { CurrentUser } from 'src/helpers/common/decorators/currentUser.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Client Subcategories')
@Controller('client/subcategory')
export class ClientSubcategoryController {
  constructor(
    private readonly clientSubcategoryService: ClientSubcategoryService,
  ) {}

  @ApiOperation({ summary: 'Get one subcategory' })
  @ApiResponse({
    status: 200,
    description: 'Subcategory returned successfully',
  })
  @ApiResponse({ status: 404, description: 'Subcategory not found' })
  @ApiParam({ name: 'id', description: 'Subcategory ID', type: String })
  @Get(':id')
  getOneSubcategory(
    @Param('id', ParseUUIDPipe) subcategoryId: string,
    @Query() query: GetClientSubcategoryDto,
  ) {
    const subcategory = this.clientSubcategoryService.getOneSubcategory(
      subcategoryId,
      query,
    );

    return subcategory;
  }

  @ApiOperation({ summary: 'Get one subcategory with authentication' })
  @ApiResponse({
    status: 200,
    description: 'Subcategory returned successfully',
  })
  @ApiResponse({ status: 404, description: 'Subcategory not found' })
  @UseGuards(ClientAuthGuard)
  @ApiParam({ name: 'id', description: 'Subcategory ID', type: String })
  @Get('authenticated/:id')
  getOneSubcategoryWithAuth(
    @Param('id', ParseUUIDPipe) subcategoryId: string,
    @Query() query: GetClientSubcategoryDto,
    @CurrentUser() currentUser: UserEntity,
  ) {
    const subcategory = this.clientSubcategoryService.getOneSubcategory(
      subcategoryId,
      query,
      currentUser,
    );

    return subcategory;
  }
}
