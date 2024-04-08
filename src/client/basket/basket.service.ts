import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/users/entities/user.entity';
import { UpdateBasketProductDto } from './dto/updateBasket.dto';
import { GetBasketProducts } from './dto/getBasketProducts.dto';
import { BasketEntity } from './entities/basket.entity';
import { ProductEntity } from 'src/admin/stock/product/entities/product.entity';

@Injectable()
export class UserBasketService {
  constructor(
    @InjectRepository(BasketEntity)
    private basketRepository: Repository<BasketEntity>,
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
  ) {}

  async addProductToBasket(userId: string, productId: string) {
    const product = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.prices', 'price')
      .where('product.id = :productId', { productId })
      .getOne();
    if (!product) throw new NotFoundException('Product not found');

    const candidate = await this.basketRepository.findOne({
      where: { productId: productId, userId: userId },
    });
    if (candidate)
      throw new ConflictException(
        `Product with id ${productId} already exists in basket!`,
      );

    const maxPrice = product.prices
      .map((price) => price.price)
      .reduce((max, currentPrice) => Math.max(max, currentPrice), -Infinity);

    const basketProduct = this.basketRepository.create({
      productId: productId,
      userId: userId,
      productPrice: maxPrice,
      productQuantity: 1,
      productSum: maxPrice,
    });
    await this.basketRepository.save(basketProduct);
    return {
      basketProduct: basketProduct,
      message: 'Product added to basket successfully!',
    };
  }

  async getBasketProductList(user: UserEntity, query?: GetBasketProducts) {
    const { lng = 'tkm' } = query;
    const basketProductQuery = this.basketRepository
      .createQueryBuilder('basketProducts')
      .leftJoin('basketProducts.basketProduct', 'products')
      .leftJoin('products.productAttributes', 'productAttributes')
      .leftJoin('products.medias', 'medias')
      .leftJoin('products.prices', 'prices')
      .select([
        'basketProducts.id',
        'basketProducts.productQuantity',
        'basketProducts.productSum',
        'basketProducts.productPrice',
        'products.id',
        'products.article',
        'products.commodity',
        'products.currentSaleQuantity',
        'productAttributes.title',
        'productAttributes.description',
        'productAttributes.description',
        'productAttributes.manufacturerCountry',
        'medias.id',
        'medias.imageName',
        'medias.imagePath',
        'medias.originalName',
        'medias.mimeType',
        'prices.id',
        'prices.price',
        'prices.quantity',
        'prices.userType',
      ])
      .where(
        'basketProducts.userId = :userId AND productAttributes.language = :language AND prices.userType = :userType',
        { userId: user.id, language: lng, userType: user.role },
      );

    if (query.commodity) {
      basketProductQuery.andWhere('products.commodity = :commodity', {
        commodity: query.commodity,
      });
    }

    const [basketProducts, count] = await basketProductQuery.getManyAndCount();

    return {
      basketProducts: basketProducts,
      basketProductCount: count,
      message: 'Basket products retrieved successfully!',
    };
  }

  async removeProductFromBasket(userId: string, basketProductId: string) {
    const candidate = await this.getOneBasketProduct(basketProductId, userId);
    if (!candidate)
      throw new NotFoundException(
        `Basket item with id ${basketProductId} not found!`,
      );

    await this.basketRepository.delete({
      id: basketProductId,
      userId: userId,
    });
    return {
      message: 'Basket item deleted successfully!',
    };
  }

  async getOneBasketProduct(basketProductId: string, userId: string) {
    const basketProduct = await this.basketRepository.findOne({
      where: { userId: userId, id: basketProductId },
    });
    if (!basketProduct)
      throw new NotFoundException('Basket product not found!');
    return basketProduct;
  }

  async updateBasketProduct(
    basketProductId: string,
    dto: UpdateBasketProductDto,
    user: UserEntity,
  ) {
    const productInBasket = await this.getOneBasketProduct(
      basketProductId,
      user.id,
    );

    const product = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.prices', 'price')
      .where('product.id = :productId', {
        productId: productInBasket.productId,
      })
      .getOne();
    let selectedPrice;
    for (const price of product.prices) {
      if (productInBasket.productQuantity >= price.quantity) {
        selectedPrice = price;
      }
    }

    if (!selectedPrice) {
      selectedPrice = productInBasket.productPrice;

      productInBasket.productPrice = selectedPrice;
      productInBasket.productQuantity += dto.quantityUpdate;
      productInBasket.productSum =
        productInBasket.productQuantity * selectedPrice;
      if (productInBasket.productQuantity <= 0)
        throw new ConflictException('Quantity cannot be less than 1.');
      if (productInBasket.productQuantity >= product.currentSaleQuantity)
        throw new ConflictException(
          'Cannot add quantity more than current sale quantity ',
        );
      await this.basketRepository.save(productInBasket);

      return {
        product: productInBasket,
        message: 'Basket product data updated successfully!',
      };
    }

    if (productInBasket.productQuantity <= 0)
      throw new ConflictException('Quantity cannot be less than 1.');

    if (productInBasket.productQuantity >= product.currentSaleQuantity)
      throw new ConflictException(
        `Cannot add quantity more than current sale quantity ${product.currentSaleQuantity}`,
      );
    productInBasket.productPrice = selectedPrice.price;
    productInBasket.productQuantity += dto.quantityUpdate;
    productInBasket.productSum =
      productInBasket.productQuantity * selectedPrice.price;
    await this.basketRepository.save(productInBasket);

    return {
      basketProduct: productInBasket,
      message: 'Basket product data updated successfully!',
    };
  }

  async getUserBasketProducts(user: UserEntity) {
    const basketProducts = await this.basketRepository
      .createQueryBuilder('basketProducts')
      .leftJoin('basketProducts.basketProduct', 'products')
      .leftJoin('products.productAttributes', 'productAttributes')
      .leftJoin('products.medias', 'medias')
      .leftJoin('products.prices', 'prices')
      .select([
        'basketProducts.id',
        'basketProducts.productQuantity',
        'basketProducts.productSum',
        'basketProducts.productPrice',
        'products.id',
        'products.article',
        'products.commodity',
        'products.currentSaleQuantity',
        'productAttributes.title',
        'productAttributes.description',
        'productAttributes.description',
        'productAttributes.manufacturerCountry',
        'medias.id',
        'medias.imageName',
        'medias.imagePath',
        'medias.originalName',
        'medias.mimeType',
        'prices.id',
        'prices.price',
        'prices.quantity',
        'prices.userType',
      ])
      .where(
        'basketProducts.userId = :userId AND prices.userType = :userType',
        { userId: user.id, userType: user.role },
      )
      .getMany();
    return basketProducts;
  }
}
