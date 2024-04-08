import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from 'src/admin/stock/product/entities/product.entity';
import { Brackets, Repository } from 'typeorm';
import { GetOneClientProduct } from './dto/getOneProduct.dto';
import { UserEntity } from 'src/client/user/users/entities/user.entity';
import {
  GetClientProductsOrderEnum,
  LngEnum,
  OrderType,
} from 'src/helpers/constants';
import { GetClientProducts } from './dto/getProducts.dto';

@Injectable()
export class ClientProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
  ) {}

  async getOneProduct(
    productId: string,
    query: GetOneClientProduct,
    user?: UserEntity,
  ) {
    const { lng = LngEnum.tkm } = query;

    const userType = user ? user.role : 'user';

    const productQuery = this.productRepository
      .createQueryBuilder('products')
      .leftJoin('products.productAttributes', 'productAttributes')
      .leftJoin('products.medias', 'medias')
      .leftJoin('products.prices', 'prices');
    if (user) {
      productQuery
        .leftJoinAndSelect(
          'products.likedProducts',
          'likedProducts',
          'likedProducts.userId = :userId',
          { userId: user.id },
        )
        .leftJoinAndSelect(
          'products.basketProduct',
          'basketProducts',
          'basketProducts.userId = :userId',
          {
            userId: user.id,
          },
        );
    }
    const product = await productQuery
      .select([
        'products.id',
        'products.article',
        'products.commodity',
        'products.barcode',
        'products.currentSaleQuantity',
        'productAttributes.title',
        'productAttributes.manufacturerCountry',
        'productAttributes.description',
        'productAttributes.language',
        'medias.id',
        'medias.imageName',
        'medias.imagePath',
        'medias.originalName',
        'medias.mimeType',
        'prices.id',
        'prices.price',
        'prices.quantity',
        'prices.userType',
        user ? 'likedProducts.productId' : 'NULL as likedProductId',
      ])
      .where(
        'productAttributes.language = :language  AND prices.userType = :userType AND productAttributes.id IS NOT NULL AND medias.id IS NOT NULL AND prices.price IS NOT NULL AND products.currentSaleQuantity > 0',
        {
          language: lng,
          userType,
        },
      )
      .getOne();

    if (!product)
      throw new BadRequestException(`Product with id ${productId} not found!`);

    return product;
  }

  async getProducts(query: GetClientProducts, user?: UserEntity) {
    const {
      page = 1,
      take = 10,
      orderBy = GetClientProductsOrderEnum.createdAt,
      order = OrderType.ASC,
      search = '',
      lng = LngEnum.tkm,
    } = query;

    const userType = user ? user.role : 'user';

    const productQuery = this.productRepository
      .createQueryBuilder('products')
      .leftJoin('products.productAttributes', 'productAttributes')
      .leftJoin('products.medias', 'medias')
      .leftJoin('products.prices', 'prices');
    if (user) {
      productQuery
        .leftJoinAndSelect(
          'products.likedProducts',
          'likedProducts',
          'likedProducts.userId = :userId',
          { userId: user.id },
        )
        .leftJoinAndSelect(
          'products.basketProduct',
          'basketProducts',
          'basketProducts.userId = :userId',
          {
            userId: user.id,
          },
        );
    }
    productQuery
      .select([
        'products.id',
        'products.article',
        'products.commodity',
        'products.barcode',
        'products.currentSaleQuantity',
        'productAttributes.title',
        'productAttributes.manufacturerCountry',
        'productAttributes.description',
        'productAttributes.language',
        'medias.id',
        'medias.imageName',
        'medias.imagePath',
        'medias.mimeType',
        'medias.originalName',
        'prices.id',
        'prices.price',
        'prices.quantity',
        'prices.userType',
        'prices.createdAt',
        user ? 'likedProducts.productId' : 'NULL AS likedProductsId',
        user ? 'basketProducts.productId' : 'NULL AS basketProductsId',
      ])
      .where(
        'productAttributes.language = :language  AND prices.userType = :userType AND productAttributes.id IS NOT NULL AND medias.id IS NOT NULL AND prices.price IS NOT NULL AND products.currentSaleQuantity > 0',
        {
          language: lng,
          userType,
        },
      )
      .andWhere(
        new Brackets((qb) => {
          qb.where('productAttributes.title ILIKE :search', {
            search: `%${search}%`,
          }).orWhere(
            'products.article ILIKE :search OR products.barcode ILIKE :search',
            {
              search: `%${search}%`,
            },
          );
        }),
      )
      .orderBy(`prices.${orderBy}`, order)
      .take(take)
      .skip((page - 1) * take);

    if (query.commodity) {
      productQuery.andWhere('products.commodity = :commodity', {
        commodity: query.commodity,
      });
    }

    const products = await productQuery.getMany();

    return products;
  }

  async getByProductId(productId: string) {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product)
      throw new BadRequestException(`Product with id ${productId} not found!`);

    return product;
  }
}
