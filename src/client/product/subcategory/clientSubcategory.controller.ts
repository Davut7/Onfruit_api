import {
  Controller,
  Get,
  NotFoundException,
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
  ApiOkResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

@ApiTags('client-subcategory')
@Controller('client/subcategory')
export class ClientSubcategoryController {
  constructor(
    private readonly clientSubcategoryService: ClientSubcategoryService,
  ) {}

  @ApiOperation({ summary: 'Get one subcategory' })
  @ApiOkResponse({
    description: 'Subcategory returned successfully',
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Subcategory not found',
  })
  @Get(':subcategoryId')
  getOneSubcategory(
    @Param('subcategoryId', ParseUUIDPipe) subcategoryId: string,
    @Query() query: GetClientSubcategoryDto,
  ) {
    const subcategory = this.clientSubcategoryService.getOneSubcategory(
      subcategoryId,
      query,
    );

    return subcategory;
  }

  @ApiOperation({ summary: 'Get one subcategory with authentication' })
  @ApiOkResponse({
    description: 'Subcategory returned successfully',
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Subcategory not found',
  })
  @UseGuards(ClientAuthGuard)
  @Get('authenticated/:subcategoryId')
  getOneSubcategoryWithAuth(
    @Param('subcategoryId', ParseUUIDPipe) subcategoryId: string,
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
