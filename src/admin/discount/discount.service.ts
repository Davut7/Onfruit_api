import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DiscountEntity } from './entities/discount.entity';
import { Repository } from 'typeorm';
import { CreateDiscountDto } from './dto/createDiscount.dto';
import { ProductEntity } from '../stock/product/entities/product.entity';
import { UpdateDiscountDto } from './dto/updateDiscount.dto';

@Injectable()
export class DiscountService {
  constructor(
    @InjectRepository(DiscountEntity)
    private discountRepository: Repository<DiscountEntity>,
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
  ) {}

  async createDiscount(productId: string, dto: CreateDiscountDto) {
    const product = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.prices', 'prices')
      .where('product.id = :productId AND prices.userType = :userType', {
        productId,
        userType: dto.userType,
      })
      .getOne();

    if (!product) throw new NotFoundException('Product not found!');

    const discount = this.discountRepository.create({
      ...dto,
      productId: productId,
    });

    for (const productPrice of product.prices) {
      ((productPrice.price - dto.discountPercent) / productPrice.price) * 100;
    }

    await this.productRepository.save(product);

    await this.discountRepository.save(discount);
    return {
      message: 'Product discount created successfully',
      discount: discount,
    };
  }

  async getDiscounts() {
    const [discounts, count] = await this.discountRepository
      .createQueryBuilder('discount')
      .leftJoinAndSelect('discount.product', 'product')
      .getManyAndCount();

    return {
      messages: 'Product with discount returned successfully',
      discounts: discounts,
      discountsCount: count,
    };
  }

  async getOneDiscount(discountId: string) {
    const discount = await this.discountRepository
      .createQueryBuilder('discount')
      .leftJoinAndSelect('discount.product', 'product')
      .leftJoinAndSelect('product.productAttributes', 'productAttributes')
      .leftJoinAndSelect('product.medias', 'medias')
      .leftJoinAndSelect('product.prices', 'prices')
      .where('discount.id = :discountId', { discountId })
      .getOne();
    if (!discount) throw new NotFoundException('Discount not found');

    return discount;
  }

  async updateDiscount(discountId: string, dto: UpdateDiscountDto) {
    const discount = await this.getOneDiscount(discountId);

    discount.discountPercent = dto.discountPercent;
    await this.discountRepository.save(discount);

    for (const productPrice of discount.product.prices) {
      ((productPrice.price - dto.discountPercent) / productPrice.price) * 100;
    }

    await this.productRepository.save(discount.product);

    return {
      message: 'Discount updated successfully',
      discount: discount,
    };
  }

  async deleteDiscount(discountId: string) {
    const discount = await this.getOneDiscount(discountId);
    const product = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.prices', 'prices')
      .where('product.id = :productId', {
        discountId: discount.productId,
      })
      .getOne();
    for (const productPrice of product.prices) {
      (productPrice.price - discount.discountPercent) /
        productPrice.price /
        100;
    }
    await this.productRepository.save(product);

    await this.discountRepository.delete(discount.id);

    return {
      message: 'Discount deleted',
    };
  }
}
