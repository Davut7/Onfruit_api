import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, QueryRunner } from 'typeorm';
import { RealizationEntity } from './entities/realizations.entity';
import { ProductService } from 'src/admin/stock/product/product.service';
import { ProductEntity } from 'src/admin/stock/product/entities/product.entity';
import { OrderType, RealizationOrderEnum } from 'src/helpers/constants';
import { CreateRealizationDto } from './dto/createRealization.dto';
import { GetRealizationsDto } from './dto/getRealizations.dto';
import { UpdateRealizationDto } from './dto/updateRealization.dto';
import { GetOneRealizationDto } from './dto/getOneRealization.dto';

@Injectable()
export class RealizationService {
  private readonly logger = new Logger(RealizationService.name);
  constructor(
    @InjectRepository(RealizationEntity)
    private realizationPriceRepository: Repository<RealizationEntity>,
    private readonly productService: ProductService,
    private readonly dataSource: DataSource,
  ) {}

  async createRealization(dto: CreateRealizationDto, productId: string) {
    this.logger.log(`Creating realization for product with id ${productId}`);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const product = await this.productService.getProductById(productId);
    if (product.article !== dto.productArticle) {
      this.logger.error(
        `Provided article ${dto.productArticle} and product article ${product.article} not same`,
      );
      throw new BadRequestException(
        `Product article ${product.article} not same with provided article ${dto.productArticle}`,
      );
    }
    await this.productService.checkStockToQuantity(product, dto);
    try {
      const realization = queryRunner.manager.create(RealizationEntity, {
        productId: productId,
        quantity: dto.quantity,
        productArticle: dto.productArticle,
        sum: dto.sum,
        middlePrice: dto.middlePrice,
      });
      await queryRunner.manager.save(realization);
      await this.decreaseProductOnRealizationDelete(realization, queryRunner);
      return realization;
    } catch (err: any) {
      this.logger.error(
        `Error while creating realizations for product with id ${productId}`,
      );
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(err.message);
    } finally {
      this.logger.log(
        `Realizations for product with id ${product.id} created successfully!`,
      );
      await queryRunner.release();
    }
  }

  async getRealizations(query: GetRealizationsDto) {
    this.logger.log(`Getting realizations!`);
    const {
      page = 1,
      take = 10,
      search = '',
      orderBy = RealizationOrderEnum.createdAt,
      order = OrderType.ASC,
    } = query;
    const [realizations, realizationsCount] = await this.realizationPriceRepository
      .createQueryBuilder('realizations')
      .select([
        'realizations.id',
        'realizations.productArticle',
        'realizations.quantity',
        'realizations.middlePrice',
        'realizations.sum',
        'realizations.createdAt',
        'realizations.productId',
      ])
      .where('realizations.productArticle ILIKE  :search', {
        search: `%${search}%`,
      })
      .orderBy(`"${orderBy}"`, order)
      .take(take)
      .skip((page - 1) * take)
      .getManyAndCount();

    this.logger.log(`Realizations returned successfully!`);
    return { realizations, realizationsCount };
  }

  async getOneRealization(realizationId: string) {
    this.logger.log(`Getting one realization with id ${realizationId}!`);
    const realization = await this.realizationPriceRepository.findOne({
      where: { id: realizationId },
    });
    if (!realization)
      throw new BadRequestException(
        `Realization with id ${realizationId} not found!`,
      );
    this.logger.log(
      `Realization with id ${realizationId} returned successfully!`,
    );
    return realization;
  }

  async updateRealization(realizationId: string, dto: UpdateRealizationDto) {
    this.logger.log(`Updating realization with id ${realizationId}!`);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const realization = await this.getOneRealization(realizationId);
    try {
      await this.increaseProductOnRealizationDelete(realization, queryRunner);
      realization.quantity = dto.quantity;
      realization.sum = dto.sum;

      await queryRunner.manager.save(realization);
      await this.decreaseProductOnRealizationDelete(realization, queryRunner);
      return realization;
    } catch (err: any) {
      this.logger.error(
        `Error while updating realization id ${realizationId}!`,
      );
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(err.message);
    } finally {
      this.logger.log(
        `Realization with id ${realizationId} updating successfully!`,
      );
      await queryRunner.release();
    }
  }

  async deleteRealization(realizationId: string) {
    this.logger.log(`Deleting one realization with id ${realizationId}!`);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const realization = await this.getOneRealization(realizationId);
      await queryRunner.manager.delete(RealizationEntity, realization.id);
      await this.increaseProductOnRealizationDelete(realization, queryRunner);
      return { message: 'Realization deleted successfully' };
    } catch (err: any) {
      this.logger.error(
        `Error while deleting realization id ${realizationId}!`,
      );
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(err.message);
    } finally {
      this.logger.log(
        `Realization with id ${realizationId} deleting successfully!`,
      );
      await queryRunner.release();
    }
  }

  async increaseProductOnRealizationDelete(
    realization: RealizationEntity,
    queryRunner: QueryRunner,
  ) {
    this.logger.log(`Increasing product data with arrival data!`);
    const product = await queryRunner.manager.findOne(ProductEntity, {
      where: { id: realization.productId },
    });

    product.currentQuantity += realization.quantity;
    product.currentSum += realization.sum;
    product.currentSaleQuantity -= realization.quantity;
    await queryRunner.manager.save(product);
    this.logger.log(`Product data increased with arrival data!`);
    return product;
  }
  async decreaseProductOnRealizationDelete(
    realization: RealizationEntity,
    queryRunner: QueryRunner,
  ) {
    this.logger.log(`Decreasing product data with arrival data!`);
    const product = await queryRunner.manager.findOne(ProductEntity, {
      where: { id: realization.productId },
    });

    product.currentQuantity -= realization.quantity;
    product.currentSum -= realization.sum;
    product.currentSaleQuantity += realization.quantity;
    await queryRunner.manager.save(product);
    this.logger.log(`Product data decreasing with arrival data!`);
    return product;
  }

  async getRealizationByProductId(
    productId: string,
    query: GetOneRealizationDto,
  ) {
    this.logger.log(`Getting arrivals of product with id ${productId}!`);
    const {
      page = 1,
      take = 10,
      orderBy = RealizationOrderEnum.createdAt,
      order = OrderType.ASC,
    } = query;

    const [realization, count] = await this.realizationPriceRepository
      .createQueryBuilder('realizations')
      .select([
        'realizations.id',
        'realizations.productArticle',
        'realizations.quantity',
        'realizations.middlePrice',
        'realizations.sum',
        'realizations.createdAt',
      ])
      .where('realizations.productId = :productId', { productId })
      .orderBy(`"${orderBy}"`, order)
      .take(take)
      .skip((page - 1) * take)
      .getManyAndCount();

    const totalQuantities = await this.realizationPriceRepository
      .createQueryBuilder('realizations')
      .leftJoin('realizations.product', 'products')
      .leftJoin('products.productAttributes', 'productAttributes')
      .where(
        'realizations.productId = :productId AND productAttributes.language = :language',
        {
          productId,
          language: 'ru',
        },
      )
      .select([
        'SUM(realizations.quantity) as totalQuantity',
        'SUM(realizations.sum) as totalSum',
        'products.article as article',
        'products.barcode as barcode',
        'products.commodity as commodity',
        'productAttributes.title as title',
      ])
      .groupBy('article, barcode, commodity, title')
      .getRawMany();
    this.logger.log(
      `Arrivals of product with id ${productId} returned successfully!`,
    );
    return {
      realization: realization,
      realizationCount: count,
      totalQuantities: totalQuantities,
    };
  }
}
