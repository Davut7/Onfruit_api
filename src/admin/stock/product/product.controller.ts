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
  ApiOperation,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { ManufacturerCountriesEntity } from './entities/countries.entity';
import { MediaEntity } from 'src/media/entities/media.entity';
import { ProductEntity } from './entities/product.entity';

@ApiBearerAuth()
@ApiTags('products')
@UseGuards(AbilitiesGuard)
@Controller('stock/product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ApiOkResponse({
    type: [ManufacturerCountriesEntity],
    description: 'Countries got successfully',
  })
  @ApiOperation({ summary: 'Getting countries' })
  @Get('/countries')
  @CheckAbilities({
    action: ActionEnum.Read,
    subject: SubjectEnum.Products,
  })
  async getCountries(@Query() query: GetManufacturerCountries) {
    return this.productService.getCountries(query);
  }

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
  @ApiOperation({ summary: 'Create product' })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Subcategory not found',
  })
  @Post(':subcategoryId')
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
  @ApiOperation({ summary: 'Upload product image' })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Product not found',
  })
  @Post(':productId/image')
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
    @Param('productId', ParseUUIDPipe) categoryId: string,
  ) {
    if (!image) throw new BadRequestException('Please provide an image');
    return this.productService.createProductImage(categoryId, image);
  }

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
  @ApiOperation({ summary: 'Delete product image' })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Image not found',
  })
  @Delete(':mediaId/image')
  @CheckAbilities({ action: ActionEnum.Create, subject: SubjectEnum.Products })
  async deleteCategoryImage(@Param('id', ParseUUIDPipe) mediaId: string) {
    return await this.productService.deleteProductImage(mediaId);
  }

  @ApiOkResponse({
    description: 'Product returned successfully',
    schema: {
      type: 'object',
      properties: {
        products: { items: { $ref: getSchemaPath(ProductEntity) } },
        productsCount: { type: 'number' },
      },
    },
  })
  @ApiOperation({ summary: 'Get products' })
  @Get()
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
  @ApiOperation({ summary: 'Get product by article' })
  @Get('/article')
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
  @ApiOperation({ summary: 'Get product by id' })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Product by id not found',
  })
  @Get(':productId')
  @CheckAbilities({
    action: ActionEnum.Read,
    subject: SubjectEnum.Products,
  })
  async getOneProduct(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.productService.getOneProduct(productId);
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
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Product by id not found',
  })
  @ApiOperation({ summary: 'Update product by id' })
  @Patch(':productId')
  @CheckAbilities({
    action: ActionEnum.Update,
    subject: SubjectEnum.Products,
  })
  async updateProduct(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productService.updateProduct(productId, updateProductDto);
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
  @ApiOperation({ summary: 'Delete product by id' })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Product by id not found',
  })
  @Delete(':productId')
  @CheckAbilities({
    action: ActionEnum.Delete,
    subject: SubjectEnum.Products,
  })
  async deleteProduct(@Param('productId', ParseUUIDPipe) productId: string) {
    return await this.productService.deleteProduct(productId);
  }
}
