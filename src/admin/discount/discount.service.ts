import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DiscountEntity } from './entities/discount.entity';
import { Repository } from 'typeorm';
import { CreateDiscountDto } from './dto/createDiscount.dto';
import { ProductEntity } from '../stock/product/entities/product.entity';
import { UpdateDiscountDto } from './dto/updateDiscount.dto';

@Injectable()
export class DiscountService {
  private readonly logger = new Logger(DiscountService.name);

  constructor(
    @InjectRepository(DiscountEntity)
    private discountRepository: Repository<DiscountEntity>,
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
  ) {}

  async createDiscount(productId: string, dto: CreateDiscountDto) {
    this.logger.log(`Creating discount for product with ID ${productId}`);

    const product = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.prices', 'prices')
      .where('product.id = :productId AND prices.userType = :userType', {
        productId,
        userType: dto.userType,
      })
      .getOne();

    if (!product) {
      const errorMessage = 'Product not found!';
      this.logger.error(errorMessage);
      throw new NotFoundException(errorMessage);
    }

    const discount = this.discountRepository.create({
      ...dto,
      productId: productId,
    });

    for (const productPrice of product.prices) {
      productPrice.price =
        ((productPrice.price - discount.discountPercent) / productPrice.price) *
        100;
    }

    await this.productRepository.save(product);
    await this.discountRepository.save(discount);

    this.logger.log(
      `Discount created successfully for product with ID ${productId}`,
    );

    return {
      message: 'Product discount created successfully',
      discount: discount,
    };
  }

  async getDiscounts() {
    this.logger.log(`Getting discounts`);

    const [discounts, count] = await this.discountRepository
      .createQueryBuilder('discount')
      .leftJoinAndSelect('discount.product', 'product')
      .getManyAndCount();

    this.logger.log(`Discounts retrieved successfully`);

    return {
      messages: 'Product with discount returned successfully',
      discounts: discounts,
      discountsCount: count,
    };
  }

  async getOneDiscount(discountId: string) {
    this.logger.log(`Getting discount with ID ${discountId}`);

    const discount = await this.discountRepository
      .createQueryBuilder('discount')
      .leftJoinAndSelect('discount.product', 'product')
      .leftJoinAndSelect('product.productAttributes', 'productAttributes')
      .leftJoinAndSelect('product.medias', 'medias')
      .leftJoinAndSelect('product.prices', 'prices')
      .where('discount.id = :discountId', { discountId })
      .getOne();

    if (!discount) {
      const errorMessage = 'Discount not found';
      this.logger.error(errorMessage);
      throw new NotFoundException(errorMessage);
    }

    this.logger.log(`Discount with ID ${discountId} retrieved successfully`);

    return discount;
  }

  async updateDiscount(discountId: string, dto: UpdateDiscountDto) {
    this.logger.log(`Updating discount with ID ${discountId}`);

    const discount = await this.getOneDiscount(discountId);

    discount.discountPercent = dto.discountPercent;
    await this.discountRepository.save(discount);

    for (const productPrice of discount.product.prices) {
      productPrice.price =
        ((productPrice.price - discount.discountPercent) / productPrice.price) *
        100;
    }

    await this.productRepository.save(discount.product);

    this.logger.log(`Discount with ID ${discountId} updated successfully`);

    return {
      message: 'Discount updated successfully',
      discount: discount,
    };
  }

  async deleteDiscount(discountId: string) {
    this.logger.log(`Deleting discount with ID ${discountId}`);

    const discount = await this.getOneDiscount(discountId);
    const product = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.prices', 'prices')
      .where('product.id = :productId', {
        discountId: discount.productId,
      })
      .getOne();

    for (const productPrice of product.prices) {
      productPrice.price =
        ((productPrice.price - discount.discountPercent) / productPrice.price) *
        100;
    }

    await this.productRepository.save(product);
    await this.discountRepository.delete(discount.id);

    this.logger.log(`Discount with ID ${discountId} deleted successfully`);

    return {
      message: 'Discount deleted',
    };
  }
}
