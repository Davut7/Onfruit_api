import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { AbilitiesGuard } from 'src/helpers/guards/abilities.guard';
import { CheckAbilities } from 'src/helpers/common/decorators/abilityDecorator.decorator';
import { ActionEnum, SubjectEnum } from 'src/helpers/constants';
import { ProductAttributesService } from './productAttributes.service';
import { CreateProductAttrDto } from './dto/createAttribute.dto';
import { UpdateProductAttrDto } from './dto/updateAttribute.dto';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ProductAttributesEntity } from './entities/productAttributes.entity';

@ApiBearerAuth()
@ApiTags('productAttributes')
@Controller('stock/product-attributes')
export class ProductAttributesController {
  constructor(
    private readonly productAttributesService: ProductAttributesService,
  ) {}

  @ApiParam({ type: 'string', name: 'id', description: 'Product id' })
  @ApiOkResponse({
    type: ProductAttributesEntity,
    description: 'Product attribute created successfully',
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Product not found',
  })
  @Post(':id')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({
    action: ActionEnum.Create,
    subject: SubjectEnum.Products,
  })
  async createAttribute(
    @Param('id', ParseUUIDPipe) productId: string,
    @Body() dto: CreateProductAttrDto,
  ) {
    return this.productAttributesService.createProductAttributes(
      dto,
      productId,
    );
  }

  @ApiParam({ type: 'string', name: 'id', description: 'Product attribute id' })
  @ApiOkResponse({
    type: ProductAttributesEntity,
    description: 'Product attribute updated successfully',
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Product attribute by id not found',
  })
  @Patch(':id')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({
    action: ActionEnum.Update,
    subject: SubjectEnum.Products,
  })
  async updateAttribute(
    @Param('id', ParseUUIDPipe) productAttributeId: string,
    @Body() dto: UpdateProductAttrDto,
  ) {
    return this.productAttributesService.updateAttribute(
      productAttributeId,
      dto,
    );
  }

  @ApiParam({ type: 'string', name: 'id', description: 'Product attribute id' })
  @ApiOkResponse({
    type: ProductAttributesEntity,
    description: 'Product attribute returned by id successfully',
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Product not found',
  })
  @Get(':id')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({
    action: ActionEnum.Read,
    subject: SubjectEnum.Products,
  })
  async getAttribute(@Param('id', ParseUUIDPipe) id: string) {
    return this.productAttributesService.getOneAttribute(id);
  }

  @ApiParam({ type: 'string', name: 'id', description: 'Product id' })
  @ApiOkResponse({
    type: ProductAttributesEntity,
    description: 'Product attribute deleted successfully',
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Product not found',
  })
  @Delete(':id')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({
    action: ActionEnum.Delete,
    subject: SubjectEnum.Products,
  })
  async deleteAttribute(@Param('id', ParseUUIDPipe) id: string) {
    return this.productAttributesService.deleteAttribute(id);
  }
}
