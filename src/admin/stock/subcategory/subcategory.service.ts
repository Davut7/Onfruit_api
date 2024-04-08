import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { SubcategoryEntity } from './entities/subcategory.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CategoryService } from '../category/category.service';
import { ProductService } from '../product/product.service';
import { CreateSubcategoryDto } from './dto/createSubcategory.dto';
import { GetSubcategoriesDto } from './dto/getSubcategories';
import { GetOneSubcategory } from './dto/getOneSubcategory';
import { UpdateSubcategoryDto } from './dto/updateSubcategory.dto';
import { MediaService } from 'src/media/media.service';

@Injectable()
export class SubcategoryService {
  private readonly logger = new Logger(SubcategoryService.name);
  constructor(
    @InjectRepository(SubcategoryEntity)
    private subcategoryRepository: Repository<SubcategoryEntity>,
    private categoryService: CategoryService,
    @Inject(forwardRef(() => ProductService))
    private productService: ProductService,
    private readonly dataSource: DataSource,
    private mediaService: MediaService,
  ) {}

  async createSubcategory(dto: CreateSubcategoryDto, categoryId: string) {
    this.logger.log(`Creating subcategory \n ${JSON.stringify(dto, null, 2)}`);
    await this.categoryService.getOneCategory(categoryId);
    await Promise.all([
      this.checkDuplicateTitle('tkmTitle', dto.tkmTitle, categoryId),
      this.checkDuplicateTitle('enTitle', dto.enTitle, categoryId),
      this.checkDuplicateTitle('ruTitle', dto.ruTitle, categoryId),
    ]);
    const subcategory = this.subcategoryRepository.create({
      ...dto,
      categoryId: categoryId,
    });
    await this.subcategoryRepository.save(subcategory);
    this.logger.log(`Subcategory created successfully!`);
    return {
      subcategory,
      message: 'Subcategory created successfully!',
    };
  }

  async getSubcategories(query: GetSubcategoriesDto) {
    this.logger.log(`Getting all subcategories with relations!`);
    const { page = 1, take = 10, search = '', sort = 'ASC' } = query;
    const subcategories = await this.subcategoryRepository
      .createQueryBuilder('subcategory')
      .loadRelationCountAndMap(
        'subcategory.productsCount',
        'subcategory.products',
      )
      .where(
        'subcategory.tkmTitle ILIKE :search OR subcategory.ruTitle ILIKE :search OR subcategory.enTitle ILIKE :search ',
        {
          search: `%${search}%`,
        },
      )
      .leftJoin('subcategory.medias', 'medias')
      .select([
        'subcategory.id',
        'subcategory.tkmTitle',
        'subcategory.ruTitle',
        'subcategory.enTitle',
        'subcategory.createdAt',
        'medias.id',
        'medias.imagePath',
        'medias.imageName',
        'medias.mimeType',
        'medias.originalName',
      ])
      .take(take)
      .skip((page - 1) * take)
      .orderBy('subcategory.createdAt', sort || 'ASC')
      .getMany();
    this.logger.log(`All subcategories with relations returned successfully!`);
    return {
      subcategories: subcategories,
      message: 'Subcategories returned successfully!',
    };
  }

  async getOneSubcategory(subcategoryId: string, query?: GetOneSubcategory) {
    this.logger.log(
      `Getting one  subcategory with relations and  with id ${subcategoryId}!`,
    );
    const subcategory = await this.subcategoryRepository
      .createQueryBuilder('subcategory')
      .loadRelationCountAndMap(
        'subcategory.productsCount',
        'subcategory.products',
      )
      .where('subcategory.id = :id', { id: subcategoryId })
      .leftJoin('subcategory.medias', 'medias')
      .select([
        'subcategory.id',
        'subcategory.tkmTitle',
        'subcategory.ruTitle',
        'subcategory.enTitle',
        'subcategory.createdAt',
        'medias.id',
        'medias.imagePath',
        'medias.imageName',
        'medias.mimeType',
        'medias.originalName',
      ])
      .getOne();
    if (!subcategory) throw new NotFoundException(`Subcategory not found`);
    const products = await this.productService.getBySubcategoryId(
      subcategoryId,
      query,
    );
    this.logger.log(
      `Subcategory with relations and with id ${subcategoryId} returned successfully!`,
    );
    return {
      subcategory: subcategory,
      products: products,
      message: `Subcategory with id ${subcategoryId} returned successfully!`,
    };
  }

  async getSubcategoryById(subcategoryId: string) {
    this.logger.log(`Getting subcategory  with id ${subcategoryId}!`);
    const subcategory = await this.subcategoryRepository
      .createQueryBuilder('subcategory')
      .leftJoinAndSelect('subcategory.products', 'products')
      .leftJoinAndSelect('subcategory.medias', 'medias')
      .where('subcategory.id = :subcategoryId', { subcategoryId })
      .getOne();
    if (!subcategory) {
      this.logger.log(`Subcategory  with id ${subcategoryId} not  found!`);
      throw new BadRequestException(
        `Subcategory with id ${subcategoryId} not found!`,
      );
    }
    this.logger.log(
      `Subcategory  with id ${subcategoryId} returned successfully!`,
    );
    return subcategory;
  }

  async updateSubcategory(
    subcategoryId: string,
    dto: Partial<UpdateSubcategoryDto>,
  ) {
    this.logger.log(`Updating subcategory  with id ${subcategoryId}!`);
    const subcategory = await this.getSubcategoryById(subcategoryId);

    Object.assign(subcategory, dto);

    await this.subcategoryRepository.save(subcategory);
    this.logger.log(
      `Updated subcategory  with id ${subcategoryId} returned successfully!`,
    );
    return {
      subcategory: subcategory,
      message: 'Subcategory updated successfully!',
    };
  }

  async deleteSubcategory(subcategoryId: string) {
    this.logger.log(`Deleting subcategory  with id ${subcategoryId}!`);
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    let mediaIds = [];
    try {
      const subcategory = await this.getSubcategoryById(subcategoryId);

      if (subcategory.products.length > 0) {
        this.logger.log(`Cannot delete subcategory  with id ${subcategoryId}!`);
        throw new ForbiddenException(
          'Cannot delete subcategory with associated products. Please delete the products first.',
        );
      }
      for (const media of subcategory.medias) {
        mediaIds.push(media.id);
      }
      await this.mediaService.deleteMedias(mediaIds, queryRunner);
      await queryRunner.manager.delete(SubcategoryEntity, {
        id: subcategoryId,
      });
      await queryRunner.commitTransaction();

      return {
        message: 'Subcategory deleted successfully!',
      };
    } catch (err) {
      this.logger.log(
        `Error while deleting subcategory  with id ${subcategoryId}!`,
      );
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(err);
    } finally {
      this.logger.log(
        `Subcategory with id ${subcategoryId} deleted successfully!`,
      );
      await queryRunner.release();
    }
  }

  private async checkDuplicateTitle(
    language: string,
    title: string,
    categoryId?: string,
  ) {
    this.logger.log(
      `Checking duplication of subcategory with title ${title} in category with id ${categoryId}!`,
    );
    const duplicateTitle = await this.subcategoryRepository.findOne({
      where: { [language]: title, id: categoryId },
    });

    if (duplicateTitle) {
      this.logger.error(
        `Subcategory with title ${title} in category with id ${categoryId} already exists!`,
      );
      throw new ConflictException(
        `Subcategory with ${language} title '${title}' already exists!`,
      );
    }
  }

  async createSubcategoryImage(
    subcategoryId: string,
    image: Express.Multer.File,
  ) {
    await this.getSubcategoryById(subcategoryId);
    const media = await this.mediaService.createMedia(
      image,
      subcategoryId,
      'subcategoryId',
    );
    return {
      message: 'Subcategory image created successfully!',
      media: media,
    };
  }

  async deleteSubcategoryImage(mediaId: string) {
    await this.mediaService.deleteOneMedia(mediaId);
    return {
      message: 'Subcategory image deleted successfully!',
    };
  }
}
