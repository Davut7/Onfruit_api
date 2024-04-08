import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CategoryEntity } from './entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/createCategory.dto';
import { UpdateCategoryDto } from './dto/updateCategory.dto';
import { MediaService } from 'src/media/media.service';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);
  constructor(
    @InjectRepository(CategoryEntity)
    private categoryRepository: Repository<CategoryEntity>,
    private dataSource: DataSource,
    private mediaService: MediaService,
  ) {}
  async createCategory(dto: CreateCategoryDto) {
    this.logger.log(`Creating category! \n ${JSON.stringify(dto, null, 2)}`);
    await Promise.all([
      this.checkDuplicateTitle('tkmTitle', dto.tkmTitle),
      this.checkDuplicateTitle('ruTitle', dto.ruTitle),
      this.checkDuplicateTitle('enTitle', dto.enTitle),
    ]);
    const category = this.categoryRepository.create({
      ...dto,
    });

    await this.categoryRepository.save(category);
    this.logger.log(
      `Category created successfully! \n ${JSON.stringify(category, null, 2)}`,
    );
    return {
      category,
      message: 'Category created successfully!',
    };
  }

  async getCategories() {
    this.logger.log(`Getting all categories with relations`);
    const categories = await this.categoryRepository
      .createQueryBuilder('categories')
      .leftJoin('categories.subcategories', 'subcategories')
      .loadRelationCountAndMap(
        'categories.subcategoryCount',
        'categories.subcategories',
      )
      .leftJoin('categories.medias', 'categoryMedia')
      .leftJoin('subcategories.medias', 'subcategoryMedia')
      .select([
        'categories.id',
        'categories.tkmTitle',
        'categories.ruTitle',
        'categories.enTitle',
        'categoryMedia.id',
        'categoryMedia.imageName',
        'categoryMedia.imagePath',
        'categoryMedia.mimeType',
        'categoryMedia.originalName',
        'subcategories.id',
        'subcategories.tkmTitle',
        'subcategories.ruTitle',
        'subcategories.enTitle',
        'subcategoryMedia.id',
        'subcategoryMedia.imageName',
        'subcategoryMedia.imagePath',
        'subcategoryMedia.mimeType',
        'subcategoryMedia.originalName',
      ])
      .getMany();
    this.logger.log('Returned all categories with relations');
    return {
      categories: categories,
      message: 'Categories retrieved successfully!',
    };
  }

  async getOneCategory(categoryId: string) {
    this.logger.log(
      `Getting one category with relations \n ${JSON.stringify(
        categoryId,
        null,
        2,
      )}`,
    );
    const category = await this.categoryRepository
      .createQueryBuilder('categories')
      .leftJoin('categories.subcategories', 'subcategories')
      .loadRelationCountAndMap(
        'categories.subcategoryCount',
        'categories.subcategories',
      )
      .leftJoin('categories.medias', 'categoryMedia')
      .leftJoin('subcategories.medias', 'subcategoryMedia')
      .select([
        'categories.id',
        'categories.tkmTitle',
        'categories.ruTitle',
        'categories.enTitle',
        'categoryMedia.id',
        'categoryMedia.imageName',
        'categoryMedia.imagePath',
        'categoryMedia.mimeType',
        'categoryMedia.originalName',
        'subcategories.id',
        'subcategories.tkmTitle',
        'subcategories.ruTitle',
        'subcategories.enTitle',
        'subcategoryMedia.id',
        'subcategoryMedia.imageName',
        'subcategoryMedia.imagePath',
        'subcategoryMedia.mimeType',
        'subcategoryMedia.originalName',
      ])
      .where('categories.id = :categoryId', { categoryId })
      .getOne();

    if (!category) {
      this.logger.error(`Category with id ${categoryId} not found!!`);
      throw new NotFoundException(`Category with id ${categoryId} not found`);
    }
    this.logger.log('Returned one category with relations');
    return category;
  }

  async updateCategory(categoryId: string, dto: Partial<UpdateCategoryDto>) {
    this.logger.log(`Updating one category \n ${JSON.stringify(dto, null, 2)}`);
    const category = await this.getOneCategory(categoryId);

    Object.assign(category, dto);

    await this.categoryRepository.save(category);
    this.logger.log('Category updated successfully!');
    return {
      category: category,
      message: `Category with id ${categoryId} updated!`,
    };
  }

  async deleteCategory(categoryId: string) {
    this.logger.log(
      `Deleting one category \n ${JSON.stringify(categoryId, null, 2)}`,
    );
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    let mediaIds = [];
    await queryRunner.startTransaction();
    try {
      const category = await this.checkingAssociatedSubcategories(categoryId);
      for (const media of category.medias) {
        mediaIds.push(media.id);
      }
      await this.mediaService.deleteMedias(mediaIds, queryRunner);
      await queryRunner.manager.delete(CategoryEntity, { id: categoryId });
      return { message: 'Category deleted successfully!' };
    } catch (err) {
      this.logger.error('Category not deleted server error!');
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(err);
    } finally {
      await queryRunner.release();
      this.logger.log('Category deleted successfully!');
    }
  }

  private async checkDuplicateTitle(language: string, title: string) {
    this.logger.log(
      `Checking category duplication! \n ${JSON.stringify(title, null, 2)}`,
    );
    const duplicateTitle = await this.categoryRepository.findOne({
      where: { [language]: title },
    });
    if (duplicateTitle) {
      this.logger.error('Category already have in database!');
      throw new ConflictException(
        `Category with ${language} title '${title}' already exists!`,
      );
    }
  }

  private async checkingAssociatedSubcategories(categoryId: string) {
    const category = await this.getOneCategory(categoryId);
    if (category.subcategories.length > 0) {
      this.logger.error('Please delete associated subcategories first!');
      throw new ForbiddenException(
        'Please delete associated subcategories first!',
      );
    }
    return category;
  }

  async createCategoryImage(categoryId: string, image: Express.Multer.File) {
    const category = await this.getOneCategory(categoryId);
    const media = await this.mediaService.createMedia(
      image,
      category.id,
      'categoryId',
    );

    return {
      message: 'Category image uploaded successfully',
      media: media,
    };
  }

  async deleteCategoryImage(mediaId: string) {
    await this.mediaService.deleteOneMedia(mediaId);
    return {
      message: 'Media deleted successfully',
    };
  }
}
