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
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { CategoryEntity } from './entities/category.entity';
import { MediaEntity } from 'src/media/entities/media.entity';

@ApiTags('categories')
@ApiBearerAuth()
@Controller('stock/category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

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
    description: 'Category with this titles already exists!',
  })
  @Post()
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: ActionEnum.Create, subject: SubjectEnum.Products })
  async createCategory(@Body() dto: CreateCategoryDto) {
    return this.categoryService.createCategory(dto);
  }

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
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: ActionEnum.Read, subject: SubjectEnum.Products })
  async getCategories() {
    return this.categoryService.getCategories();
  }
  @ApiParam({ type: 'string', name: 'id', description: 'Category id' })
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
  @Patch(':id')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: ActionEnum.Update, subject: SubjectEnum.Products })
  async updateCategory(
    @Param('id', ParseUUIDPipe) categoryId: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoryService.updateCategory(categoryId, dto);
  }

  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Category not found',
  })
  @ApiOkResponse({
    type: CategoryEntity,
    description: 'Category returned by id',
  })
  @Get(':id')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: ActionEnum.Read, subject: SubjectEnum.Products })
  async getOneCategory(@Param('id', ParseUUIDPipe) categoryId: string) {
    const category = await this.categoryService.getOneCategory(categoryId);
    return {
      message: `Category with id ${category.id} returned successfully`,
      category: category,
    };
  }

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
  @Delete(':id')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: ActionEnum.Delete, subject: SubjectEnum.Products })
  async deleteCategory(@Param('id', ParseUUIDPipe) categoryId: string) {
    return this.categoryService.deleteCategory(categoryId);
  }

  @ApiOkResponse({
    description: 'Category imaged upload successfully',
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
    return this.categoryService.createCategoryImage(categoryId, image);
  }

  @ApiParam({ name: 'id', type: 'string', description: 'Category id' })
  @ApiOkResponse({
    description: 'Category imaged deleted successfully',
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
  @Delete(':id/image')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: ActionEnum.Create, subject: SubjectEnum.Products })
  async deleteCategoryImage(@Param('id', ParseUUIDPipe) mediaId: string) {
    return this.categoryService.deleteCategoryImage(mediaId);
  }
}
