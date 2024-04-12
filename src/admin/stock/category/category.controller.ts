import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { imageFilter } from 'src/helpers/filters/imageFilter';
import { ActionEnum, SubjectEnum } from 'src/helpers/constants';
import { AbilitiesGuard } from 'src/helpers/guards/abilities.guard';
import { CheckAbilities } from 'src/helpers/common/decorators/abilityDecorator.decorator';
import { CreateCategoryDto } from './dto/createCategory.dto';
import { UpdateCategoryDto } from './dto/updateCategory.dto';
import { randomUUID } from 'crypto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  getSchemaPath,
  ApiOperation,
} from '@nestjs/swagger';
import { CategoryEntity } from './entities/category.entity';
import { MediaEntity } from 'src/media/entities/media.entity';

@ApiTags('categories')
@ApiBearerAuth()
@UseGuards(AbilitiesGuard)
@Controller('stock/category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiOperation({ summary: 'Create a new category' })
  @ApiOkResponse({
    description: 'Category created successfully',
    schema: {
      type: 'object',
      properties: {
        category: { $ref: getSchemaPath(CategoryEntity) },
        message: { type: 'string', example: 'Category created successfully!' },
      },
    },
  })
  @ApiConflictResponse({
    type: ConflictException,
    description: 'Category with this title already exists!',
  })
  @Post()
  @CheckAbilities({ action: ActionEnum.Create, subject: SubjectEnum.Products })
  async createCategory(@Body() dto: CreateCategoryDto) {
    return this.categoryService.createCategory(dto);
  }

  @ApiOperation({ summary: 'Get all categories' })
  @ApiOkResponse({
    description: 'Categories returned successfully',
    schema: {
      type: 'object',
      properties: {
        categories: { items: { $ref: getSchemaPath(CategoryEntity) } },
        message: {
          type: 'string',
          example: 'Categories retrieved successfully!',
        },
      },
    },
  })
  @Get()
  @CheckAbilities({ action: ActionEnum.Read, subject: SubjectEnum.Products })
  async getCategories() {
    return this.categoryService.getCategories();
  }

  @ApiOperation({ summary: 'Update a category by ID' })
  @ApiOkResponse({
    description: 'Category updated by id',
    schema: {
      type: 'object',
      properties: {
        category: { $ref: getSchemaPath(CategoryEntity) },
        message: { type: 'string', example: 'Category with id updated!' },
      },
    },
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Category not found',
  })
  @Patch(':categoryId')
  @CheckAbilities({ action: ActionEnum.Update, subject: SubjectEnum.Products })
  async updateCategory(
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoryService.updateCategory(categoryId, dto);
  }

  @ApiOperation({ summary: 'Get a category by ID' })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Category not found',
  })
  @ApiOkResponse({
    type: CategoryEntity,
    description: 'Category returned by id',
  })
  @Get(':categoryId')
  @CheckAbilities({ action: ActionEnum.Read, subject: SubjectEnum.Products })
  async getOneCategory(@Param('categoryId', ParseUUIDPipe) categoryId: string) {
    const category = await this.categoryService.getOneCategory(categoryId);
    return {
      message: `Category with id ${category.id} returned successfully`,
      category: category,
    };
  }

  @ApiOperation({ summary: 'Delete a category by ID' })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Category not found',
  })
  @ApiOkResponse({
    description: 'Category deleted by id',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Category deleted successfully!' },
      },
    },
  })
  @Delete(':categoryId')
  @CheckAbilities({ action: ActionEnum.Delete, subject: SubjectEnum.Products })
  async deleteCategory(@Param('categoryId', ParseUUIDPipe) categoryId: string) {
    return this.categoryService.deleteCategory(categoryId);
  }

  @ApiOperation({ summary: 'Upload an image for a category' })
  @ApiOkResponse({
    description: 'Category image uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Category image uploaded successfully',
        },
        media: { $ref: getSchemaPath(MediaEntity) },
      },
    },
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Category not found',
  })
  @ApiBadRequestResponse({
    type: NotFoundException,
    description: 'Image not provided',
  })
  @Post(':categoryId/image')
  @ApiConsumes('multipart/form-data')
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
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
  ) {
    if (!image) throw new BadRequestException('Please provide an image');
    return this.categoryService.createCategoryImage(categoryId, image);
  }

  @ApiOperation({ summary: 'Delete an image of a category' })
  @ApiOkResponse({
    description: 'Category image deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Category image deleted successfully',
        },
      },
    },
  })
  @Delete(':mediaId/image')
  @CheckAbilities({ action: ActionEnum.Create, subject: SubjectEnum.Products })
  async deleteCategoryImage(@Param('mediaId', ParseUUIDPipe) mediaId: string) {
    return this.categoryService.deleteCategoryImage(mediaId);
  }
}
