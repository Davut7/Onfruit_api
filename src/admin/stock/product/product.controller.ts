import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { GetProductsDto } from './dto/getProducts.dto';
import { GetManufacturerCountries } from './dto/getManufacturerCountries';
import { AbilitiesGuard } from 'src/helpers/guards/abilities.guard';
import { CheckAbilities } from 'src/helpers/common/decorators/abilityDecorator.decorator';
import { ActionEnum, SubjectEnum } from 'src/helpers/constants';
import { CreateProductDto } from './dto/createProduct.dto';
import { UpdateProductDto } from './dto/updateProduct.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { imageFilter } from 'src/helpers/filters/imageFilter';
import { randomUUID } from 'crypto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { ManufacturerCountriesEntity } from './entities/countries.entity';
import { MediaEntity } from 'src/media/entities/media.entity';
import { ProductEntity } from './entities/product.entity';

@ApiBearerAuth()
@ApiTags('products')
@Controller('stock/product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ApiOkResponse({
    type: [ManufacturerCountriesEntity],
    description: 'Countries got successfully',
  })
  @Get('/countries')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({
    action: ActionEnum.Read,
    subject: SubjectEnum.Products,
  })
  async getCountries(@Query() query: GetManufacturerCountries) {
    return this.productService.getCountries(query);
  }

  @ApiParam({ type: 'string', name: 'id', description: 'Subcategory id' })
  @ApiCreatedResponse({
    description: 'Product created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        article: { type: 'string' },
        commodity: { type: 'string' },
        barcode: { type: 'string' },
        message: { type: 'string', example: 'Product created successfully!' },
      },
    },
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Subcategory not found',
  })
  @Post(':id')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({
    action: ActionEnum.Create,
    subject: SubjectEnum.Products,
  })
  async createProduct(
    @Param('id', ParseUUIDPipe) subcategoryId: string,
    @Body() dto: CreateProductDto,
  ) {
    dto.subcategoryId = subcategoryId;
    return this.productService.createProduct(dto);
  }

  @ApiParam({ type: 'string', name: 'id', description: 'Product id' })
  @ApiOkResponse({
    description: 'Product image uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        media: { $ref: getSchemaPath(MediaEntity) },
        message: {
          type: 'string',
          example: 'Product image uploaded successfully',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Product not found',
  })
  @Post(':id/image')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: ActionEnum.Create, subject: SubjectEnum.Products })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './temp',
        filename: (req, file, cb) => {
          const uniqueFileName =
            randomUUID() + `_uploaded_${file.originalname}`;
          cb(null, uniqueFileName);
        },
      }),
      fileFilter: imageFilter,
      limits: {
        fileSize: 25 * 1024 * 1024,
      },
    }),
  )
  async createCategoryImage(
    @UploadedFile() image: Express.Multer.File,
    @Param('id', ParseUUIDPipe) categoryId: string,
  ) {
    if (!image) throw new BadRequestException('Please provide an image');
    return this.productService.createProductImage(categoryId, image);
  }

  @ApiParam({ type: 'string', name: 'id', description: 'Product image id' })
  @ApiOkResponse({
    description: 'Product image deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Product image uploaded successfully',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Image not found',
  })
  @Delete(':id/image')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: ActionEnum.Create, subject: SubjectEnum.Products })
  async deleteCategoryImage(@Param('id', ParseUUIDPipe) mediaId: string) {
    return await this.productService.deleteProductImage(mediaId);
  }

  @ApiOkResponse({
    description: 'Product image deleted successfully',
    schema: {
      type: 'object',
      properties: {
        products: { items: { $ref: getSchemaPath(ProductEntity) } },
        productsCount: { type: 'number' },
      },
    },
  })
  @Get()
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({
    action: ActionEnum.Read,
    subject: SubjectEnum.Products,
  })
  async getProducts(
    @Query()
    query: GetProductsDto,
  ) {
    return this.productService.getProducts(query);
  }

  @ApiOkResponse({
    description: 'Product returned by article',
    schema: {
      type: 'object',
      properties: {
        product: { $ref: getSchemaPath(ProductEntity) },
        message: {
          example: `Product with article search returned successfully!`,
        },
      },
    },
  })
  @Get('/article')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({
    action: ActionEnum.Read,
    subject: SubjectEnum.Products,
  })
  async getByArticle(@Query('article') article: string) {
    return this.productService.getProductByArticle(article);
  }

  @ApiOkResponse({
    description: 'Product returned by id successfully',
    schema: {
      type: 'object',
      properties: {
        product: { $ref: getSchemaPath(ProductEntity) },
        message: {
          type: 'string',
          example: 'Product with id returned successfully!',
        },
      },
    },
  })
  @ApiParam({ type: 'string', name: 'id', description: 'Product id' })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Product by id not found',
  })
  @Get(':id')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({
    action: ActionEnum.Read,
    subject: SubjectEnum.Products,
  })
  async getOneProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.getOneProduct(id);
  }

  @ApiOkResponse({
    description: 'Product updated successfully',
    schema: {
      type: 'object',
      properties: {
        product: { $ref: getSchemaPath(ProductEntity) },
        message: {
          type: 'string',
          example: 'Product with id updated successfully!',
        },
      },
    },
  })
  @ApiParam({ type: 'string', name: 'id', description: 'Product id' })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Product by id not found',
  })
  @Patch(':id')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({
    action: ActionEnum.Update,
    subject: SubjectEnum.Products,
  })
  async updateProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productService.updateProduct(id, updateProductDto);
  }

  @ApiOkResponse({
    description: 'Product deleted successfully',
    schema: {
      type: 'object',
      properties: {
        product: { $ref: getSchemaPath(ProductEntity) },
        message: {
          type: 'string',
          example: 'Product with id deleted successfully!',
        },
      },
    },
  })
  @ApiParam({ type: 'string', name: 'id', description: 'Product id' })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Product by id not found',
  })
  @Delete(':id')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({
    action: ActionEnum.Delete,
    subject: SubjectEnum.Products,
  })
  async deleteProduct(@Param('id', ParseUUIDPipe) id: string) {
    return await this.productService.deleteProduct(id);
  }
}
