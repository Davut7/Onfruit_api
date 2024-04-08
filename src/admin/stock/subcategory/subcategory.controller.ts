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
  Query,
  UseGuards,
  NotFoundException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { SubcategoryService } from './subcategory.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { imageFilter } from 'src/helpers/filters/imageFilter';
import { AbilitiesGuard } from 'src/helpers/guards/abilities.guard';
import { CheckAbilities } from 'src/helpers/common/decorators/abilityDecorator.decorator';
import { ActionEnum, SubjectEnum } from 'src/helpers/constants';
import { CreateSubcategoryDto } from './dto/createSubcategory.dto';
import { GetSubcategoriesDto } from './dto/getSubcategories';
import { GetOneSubcategory } from './dto/getOneSubcategory';
import { UpdateSubcategoryDto } from './dto/updateSubcategory.dto';
import { randomUUID } from 'crypto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { SubcategoryEntity } from './entities/subcategory.entity';
import { MediaEntity } from 'src/media/entities/media.entity';
import { ProductEntity } from '../product/entities/product.entity';

@ApiTags('subcategory')
@ApiBearerAuth()
@Controller('stock/subcategory')
export class SubcategoryController {
  constructor(private readonly subcategoryService: SubcategoryService) {}

  @ApiParam({ name: 'id', type: 'string', description: 'Category id' })
  @ApiCreatedResponse({
    description: 'Subcategory created successfully',
    schema: {
      type: 'object',
      properties: {
        subcategory: { $ref: getSchemaPath(SubcategoryEntity) },
        message: {
          type: 'string',
          example: 'Subcategory created successfully!',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Category not found',
  })
  @Post(':id')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({
    action: ActionEnum.Create,
    subject: SubjectEnum.Products,
  })
  async createSubcategory(
    @Body() dto: CreateSubcategoryDto,
    @Param('id', ParseUUIDPipe) categoryId: string,
  ) {
    return this.subcategoryService.createSubcategory(dto, categoryId);
  }

  @ApiOkResponse({
    description: 'Subcategory image uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Subcategory image created successfully!',
        },
        media: {
          $ref: getSchemaPath(MediaEntity),
        },
      },
    },
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Subcategory  not found',
  })
  @ApiInternalServerErrorResponse({
    type: InternalServerErrorException,
    description: 'Error while uploading image',
  })
  @ApiBadRequestResponse({
    type: BadRequestException,
    description: 'Image must be provided',
  })
  @ApiConsumes('multipart/form-data')
  @Post(':id/image')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({
    action: ActionEnum.Create,
    subject: SubjectEnum.Products,
  })
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
  async createSubcategoryImage(
    @UploadedFile() image: Express.Multer.File,
    @Param('id', ParseUUIDPipe) subcategoryId: string,
  ) {
    if (!image) throw new BadRequestException('Please provide an image');
    return this.subcategoryService.createSubcategoryImage(subcategoryId, image);
  }

  @ApiParam({ name: 'id', type: 'string', description: 'Media id to delete' })
  @ApiOkResponse({
    description: 'Subcategory media deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Subcategory media deleted successfully!',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Media not found',
  })
  @Delete(':id/image')
  async deleteSubcategoryImage(@Param('id', ParseUUIDPipe) mediaId: string) {
    return await this.subcategoryService.deleteSubcategoryImage(mediaId);
  }

  @ApiOkResponse({
    description: 'All subcategories returned successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Subcategories returned successfully!',
        },
        subcategories: { items: { $ref: getSchemaPath(SubcategoryEntity) } },
      },
    },
  })
  @Get()
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({
    action: ActionEnum.Read,
    subject: SubjectEnum.Products,
  })
  async getSubcategories(@Query() query: GetSubcategoriesDto) {
    return await this.subcategoryService.getSubcategories(query);
  }

  @ApiParam({
    name: 'id',
    description: 'Subcategory id',
    type: 'string',
    required: true,
  })
  @ApiOkResponse({
    description: 'Subcategory returned by id',
    schema: {
      type: 'object',
      properties: {
        subcategory: { $ref: getSchemaPath(SubcategoryEntity) },
        products: { items: { $ref: getSchemaPath(ProductEntity) } },
        message: {
          type: 'string',
          example: `Subcategory with id returned successfully!`,
        },
      },
    },
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Subcategory not found',
  })
  @Get(':id')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({
    action: ActionEnum.Read,
    subject: SubjectEnum.Products,
  })
  async getOneSubcategory(
    @Param('id', ParseUUIDPipe) subcategoryId: string,
    @Query() query: GetOneSubcategory,
  ) {
    return await this.subcategoryService.getOneSubcategory(
      subcategoryId,
      query,
    );
  }

  @ApiParam({
    name: 'id',
    description: 'Subcategory id',
    type: 'string',
    required: true,
  })
  @ApiOkResponse({
    description: 'Subcategory updated by id',
    schema: {
      type: 'object',
      properties: {
        subcategory: { $ref: getSchemaPath(SubcategoryEntity) },
        message: {
          type: 'string',
          example: `Subcategory with id updated successfully!`,
        },
      },
    },
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Subcategory not found',
  })
  @Patch(':id')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({
    action: ActionEnum.Update,
    subject: SubjectEnum.Products,
  })
  async updateSubcategory(
    @Param('id', ParseUUIDPipe) subcategoryId: string,
    @Body() dto: UpdateSubcategoryDto,
  ) {
    return await this.subcategoryService.updateSubcategory(subcategoryId, dto);
  }

  @ApiParam({
    name: 'id',
    description: 'Subcategory id',
    type: 'string',
    required: true,
  })
  @ApiOkResponse({
    description: 'Subcategory deleted by id',
    schema: {
      type: 'object',
      properties: {
        subcategory: { $ref: getSchemaPath(SubcategoryEntity) },
        message: {
          type: 'string',
          example: `Subcategory deleted successfully!`,
        },
      },
    },
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Subcategory not found',
  })
  @ApiForbiddenResponse({
    type: ForbiddenException,
    description: 'Category relations not deleted',
  })
  @Delete(':id')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({
    action: ActionEnum.Delete,
    subject: SubjectEnum.Products,
  })
  async deleteSubcategory(@Param('id', ParseUUIDPipe) subcategoryId: string) {
    return await this.subcategoryService.deleteSubcategory(subcategoryId);
  }
}
