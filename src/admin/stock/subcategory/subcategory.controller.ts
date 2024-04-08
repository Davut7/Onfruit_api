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
  @Post(':categoryId')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({
    action: ActionEnum.Create,
    subject: SubjectEnum.Products,
  })
  async createSubcategory(
    @Body() dto: CreateSubcategoryDto,
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
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
  @Post(':subcategoryId/image')
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
    @Param('subcategoryId', ParseUUIDPipe) subcategoryId: string,
  ) {
    if (!image) throw new BadRequestException('Please provide an image');
    return this.subcategoryService.createSubcategoryImage(subcategoryId, image);
  }

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
  @Delete(':mediaId/image')
  async deleteSubcategoryImage(
    @Param('mediaId', ParseUUIDPipe) mediaId: string,
  ) {
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
  @Get(':subcategoryId')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({
    action: ActionEnum.Read,
    subject: SubjectEnum.Products,
  })
  async getOneSubcategory(
    @Param('subcategoryId', ParseUUIDPipe) subcategoryId: string,
    @Query() query: GetOneSubcategory,
  ) {
    return await this.subcategoryService.getOneSubcategory(
      subcategoryId,
      query,
    );
  }

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
  @Patch(':subcategoryId')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({
    action: ActionEnum.Update,
    subject: SubjectEnum.Products,
  })
  async updateSubcategory(
    @Param('subcategoryId', ParseUUIDPipe) subcategoryId: string,
    @Body() dto: UpdateSubcategoryDto,
  ) {
    return await this.subcategoryService.updateSubcategory(subcategoryId, dto);
  }

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
  @Delete(':subcategoryId')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({
    action: ActionEnum.Delete,
    subject: SubjectEnum.Products,
  })
  async deleteSubcategory(
    @Param('subcategoryId', ParseUUIDPipe) subcategoryId: string,
  ) {
    return await this.subcategoryService.deleteSubcategory(subcategoryId);
  }
}
