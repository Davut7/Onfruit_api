import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RealizationPriceEntity } from './entities/realizationPrices.entity';
import { CreateRealizationPriceDto } from './dto/createRealization.dto';
import { UpdateRealizationPriceDto } from './dto/updateRealization.dto';
import { GetPricesDto } from './dto/getPrices.dto';
import { ProductService } from 'src/admin/stock/product/product.service';

@Injectable()
export class RealizationPricesService {
  private readonly logger = new Logger(RealizationPricesService.name);
  constructor(
    @InjectRepository(RealizationPriceEntity)
    private realizationPriceRepository: Repository<RealizationPriceEntity>,
    private productService: ProductService,
  ) {}
  async createRealizationPrice(
    dto: CreateRealizationPriceDto,
    productId: string,
  ) {
    this.logger.log('Creating product price');
    await this.productService.getProductById(productId);
    const candidate = await this.realizationPriceRepository.findOne({
      where: {
        quantity: dto.quantity,
        productId: productId,
        userType: dto.userType,
      },
    });
    if (candidate) {
      this.logger.error(
        `Product price with price ${dto.price} already exists!`,
      );
      throw new BadRequestException('This price already exists!');
    }
    const price = this.realizationPriceRepository.create({
      quantity: dto.quantity,
      price: dto.price,
      userType: dto.userType,
      productId: productId,
    });
    await this.realizationPriceRepository.save(price);
    this.logger.log('Product price created successfully');
    return price;
  }

  async getPrices(productId: string, query: GetPricesDto) {
    this.logger.log(`Finding all prices of product with id ${productId}`);
    await this.productService.getProductById(productId);
    const pricesQuery = this.realizationPriceRepository
      .createQueryBuilder('realizationPrices')
      .select([
        'realizationPrices.id',
        'realizationPrices.price',
        'realizationPrices.quantity',
        'realizationPrices.userType',
        'realizationPrices.productId',
        'realizationPrices.createdAt',
      ])
      .where(`realizationPrices.productId = :productId`, {
        productId: productId,
      });
    if (query.userType)
      pricesQuery.andWhere(`realizationPrices.userType = :userType`, {
        userType: query.userType,
      });
    const prices = await pricesQuery.getMany();
    this.logger.log(
      `All prices of product with id ${productId} returned successfully`,
    );
    return prices;
  }

  private async getOneRealizationPrice(priceId: string) {
    this.logger.log(`Finding one product price with id ${priceId}`);
    const price = await this.realizationPriceRepository.findOne({
      where: { id: priceId },
    });
    if (!price) {
      this.logger.error(`Product price with id  ${priceId} not found`);
      throw new NotFoundException(
        `Product price with id  ${priceId} not found`,
      );
    }
    this.logger.log(`Product price with id ${priceId} returned successfully`);
    return price;
  }

  async updateRealizationPrice(
    priceId: string,
    dto: UpdateRealizationPriceDto,
  ) {
    this.logger.log(`Updating one product price with id ${priceId}`);
    const price = await this.getOneRealizationPrice(priceId);
    price.price = dto.price;
    price.quantity = dto.quantity;
    price.userType = dto.userType;
    await this.realizationPriceRepository.save(price);
    this.logger.log(`Product price with id ${priceId} updated successfully!`);
    return price;
  }

  async deleteRealizationPrice(priceId: string) {
    this.logger.log(`Deleting one product price with id ${priceId}`);
    const price = await this.getOneRealizationPrice(priceId);
    await this.realizationPriceRepository.delete(price.id);
    this.logger.log(`Product price with id ${priceId} deleted successfully!`);
    return { message: 'Price deleted successfully!' };
  }
}
