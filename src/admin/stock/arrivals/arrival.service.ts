import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { ArrivalEntity } from './entities/arrival.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { ProductService } from '../product/product.service';
import { ProductEntity } from '../product/entities/product.entity';
import {
  GetArrivalByProductOrderEnum,
  GetArrivalsOrderEnum,
  OrderType,
} from 'src/helpers/constants';
import { CreateArrivalDto } from './dto/createArrival.dto';
import { GetArrivalsDto } from './dto/getArrivals.dto';
import { UpdateArrivalDto } from './dto/updateArrival.dto';
import { GetOneArrivalDto } from './dto/getOneArrival.dto';

@Injectable()
export class ArrivalService {
  private readonly logger = new Logger(ArrivalService.name);
  constructor(
    @InjectRepository(ArrivalEntity)
    private arrivalRepository: Repository<ArrivalEntity>,
    @Inject(forwardRef(() => ProductService))
    private productService: ProductService,
    private dataSource: DataSource,
  ) {}

  async createArrival(dto: CreateArrivalDto) {
    this.logger.log(
      `Creating arrival for product with id ${
        dto.productId
      } \n ${JSON.stringify(dto, null, 2)}`,
    );
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const product = await this.productService.getProductById(dto.productId);
    if (dto.productArticle != product.article)
      throw new BadRequestException(
        `Provided article ${dto.productArticle} not same with product ${product.article} article`,
      );
    try {
      const arrival = queryRunner.manager.create(ArrivalEntity, {
        arrivePrice: dto.arrivePrice,
        productArticle: dto.productArticle,
        productId: dto.productId,
        quantity: dto.quantity,
        spoiledQuantity: dto.spoiledQuantity,
        sum: dto.sum,
      });

      await queryRunner.manager.save(arrival);

      await this.increaseProductData(arrival, queryRunner);

      await queryRunner.commitTransaction();
      return {
        arrival: arrival,
        message: 'Arrival created successfully!',
      };
    } catch (err) {
      this.logger.error(
        `Arrival for product with id ${dto.productId} not created!`,
      );
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(err);
    } finally {
      this.logger.log(
        `Arrival for product with id ${dto.productId} created successfully!`,
      );
      await queryRunner.release();
    }
  }
  async getArrivals(query?: GetArrivalsDto) {
    this.logger.log(`Getting all arrivals`);
    const {
      page = 1,
      take = 10,
      search = '',
      orderBy = GetArrivalsOrderEnum.createdAt,
      order = OrderType.ASC,
    } = query;

    const [arrivals, arrivalsCount] = await this.arrivalRepository
      .createQueryBuilder('arrivals')
      .leftJoin('arrivals.product', 'products')
      .select([
        'arrivals.id',
        'arrivals.quantity',
        'arrivals.arrivePrice',
        'arrivals.sum',
        'arrivals.productArticle',
        'arrivals.spoiledQuantity',
        'arrivals.createdAt',
      ])
      .where('arrivals.productArticle ILIKE :search', {
        search: `%${search}%`,
      })
      .take(take)
      .skip((page - 1) * take)
      .orderBy('arrivals.' + orderBy, order)
      .getManyAndCount();

    this.logger.log(`All arrivals returned successfully!`);
    return { arrivals: arrivals, arrivalsCount: arrivalsCount };
  }

  async getOneArrival(arrivalId: string) {
    this.logger.log(`Getting arrival with id ${arrivalId}!`);
    const arrival = await this.arrivalRepository.findOne({
      where: { id: arrivalId },
    });
    if (!arrival) {
      this.logger.error(`Arrival with id ${arrivalId}  not found!`);
      throw new NotFoundException(`Arrival with id ${arrivalId} not found!`);
    }
    this.logger.log(`Arrival with id ${arrivalId} returned successfully!`);
    return arrival;
  }

  async updateArrival(arrivalId: string, dto: UpdateArrivalDto) {
    this.logger.log(
      `Updating arrival with id ${arrivalId}! \n ${JSON.stringify(
        dto,
        null,
        2,
      )}`,
    );
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const arrival = await this.getOneArrival(arrivalId);
      await this.decreaseProductData(arrival, queryRunner);
      arrival.arrivePrice = dto.arrivePrice;
      arrival.quantity = dto.quantity;
      arrival.spoiledQuantity = dto.spoiledQuantity;
      arrival.sum = dto.sum;
      await queryRunner.manager.save(arrival);
      await this.increaseProductData(arrival, queryRunner);
      return arrival;
    } catch (err) {
      this.logger.error(`Arrival with id ${arrivalId} not updated!`);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(err);
    } finally {
      this.logger.log(`Arrival with id ${arrivalId} returned successfully!`);
      await queryRunner.release();
    }
  }

  async deleteArrival(arrivalId: string) {
    this.logger.error(`Deleting arrival with id ${arrivalId}!`);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const arrival = await this.getOneArrival(arrivalId);

      await queryRunner.manager.delete(ArrivalEntity, {
        id: arrivalId,
      });
      await this.decreaseProductData(arrival, queryRunner);
      return { message: 'Arrival deleted successfully!' };
    } catch (err) {
      this.logger.error(`Arrival with id ${arrivalId} not deleted!`);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(err);
    } finally {
      await queryRunner.release();
      this.logger.log(`Arrival with id ${arrivalId} deleted successfully!`);
    }
  }

  async getByProductId(productId: string, query: GetOneArrivalDto) {
    this.logger.log(`Getting arrivals in product with id ${productId}!`);
    const {
      page = 1,
      take = 10,
      orderBy = GetArrivalByProductOrderEnum.createdAt,
      order = OrderType.ASC,
    } = query;

    const [arrivals, arrivalsCount] = await this.arrivalRepository
      .createQueryBuilder('arrivals')
      .where('arrivals.productId = :productId', { productId })
      .select([
        'arrivals.id',
        'arrivals.quantity',
        'arrivals.arrivePrice',
        'arrivals.sum',
        'arrivals."spoiledQuantity"',
        'arrivals.createdAt',
      ])
      .groupBy('arrivals.id')
      .take(take)
      .skip((page - 1) * take)
      .orderBy(`"${orderBy}"`, order)
      .getManyAndCount();

    const totalQuantities = await this.arrivalRepository
      .createQueryBuilder('arrivals')
      .leftJoinAndSelect('arrivals.product', 'products')
      .leftJoinAndSelect('products.productAttributes', 'productAttributes')
      .where(
        'arrivals.productId = :productId AND productAttributes.language = :language ',
        { productId, language: 'ru' },
      )
      .select([
        'SUM(arrivals.quantity) as totalQuantity',
        'SUM(arrivals.sum) as totalSum',
        'SUM(arrivals.spoiledQuantity) as totalSpoiledQuantity',
        'products.article as article',
        'products.barcode as barcode',
        'products.commodity as commodity',
        'productAttributes.title as title',
      ])
      .groupBy('arrivals.productId, article, barcode, commodity, title')
      .getRawMany();

    this.logger.log(
      `Arrivals in product with id ${productId} returned successfully!`,
    );
    return {
      arrivals: arrivals,
      totalQuantities: totalQuantities,
      arrivalsCount: arrivalsCount,
    };
  }

  async increaseProductData(arrival: ArrivalEntity, queryRunner: QueryRunner) {
    this.logger.error(`Increasing data of arrival  with id ${arrival.id}!`);
    const product = await queryRunner.manager.findOne(ProductEntity, {
      where: { id: arrival.productId },
    });
    product.currentQuantity += arrival.quantity;
    product.currentSum += arrival.sum;
    product.currentSpoiledQuantity += arrival.spoiledQuantity;

    await queryRunner.manager.save(product);
    this.logger.error(`Arrival with id ${arrival.id} increased!`);
  }

  async decreaseProductData(arrival: ArrivalEntity, queryRunner: QueryRunner) {
    this.logger.error(`Decreasing data of arrival  with id ${arrival.id}!`);
    const product = await queryRunner.manager.findOne(ProductEntity, {
      where: { id: arrival.productId },
    });

    product.currentQuantity -= arrival.quantity;
    product.currentSum -= arrival.sum;
    product.currentSpoiledQuantity -= arrival?.spoiledQuantity;

    await queryRunner.manager.save(product);
    this.logger.error(`Arrival with id ${arrival.id} decreased!`);
    return product;
  }
}
