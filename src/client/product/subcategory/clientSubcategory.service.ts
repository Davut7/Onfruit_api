import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from 'src/admin/stock/product/entities/product.entity';
import { SubcategoryEntity } from 'src/admin/stock/subcategory/entities/subcategory.entity';
import { Brackets, Repository } from 'typeorm';
import { GetClientSubcategoryDto } from './dto/getSubcategory.dto';
import { UserEntity } from 'src/client/user/users/entities/user.entity';
import {
  GetClientSubcategoryOrderEnum,
  LngEnum,
  OrderType,
} from 'src/helpers/constants';

@Injectable()
export class ClientSubcategoryService {
  constructor(
    @InjectRepository(SubcategoryEntity)
    private subcategoryRepository: Repository<SubcategoryEntity>,
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
  ) {}

  async getOneSubcategory(
    subcategoryId: string,
    query: GetClientSubcategoryDto,
    user?: UserEntity,
  ) {
    const { lng = LngEnum.tkm } = query;
    const subcategory = await this.subcategoryRepository
      .createQueryBuilder('subcategory')
      .leftJoin('subcategory.medias', 'medias')
      .select([
        'subcategory.id',
        `subcategory.${lng}Title`,
        'medias.id',
        'medias.imagePath',
        'medias.imageName',
        'medias.mimeType',
        'medias.originalName',
      ])
      .where('subcategory.id = :subcategoryId', {
        subcategoryId: subcategoryId,
      })
      .getOne();
    if (!subcategory)
      throw new NotFoundException(
        `Subcategory with ${subcategoryId} not found!`,
      );
    const products = await this.getProductsBySubcategory(
      subcategoryId,
      query,
      user,
    );

    return {
      subcategory: subcategory,
      products: products,
      message: 'Subcategory returned successfully!',
    };
  }

  async getProductsBySubcategory(
    subcategoryId: string,
    query: GetClientSubcategoryDto,
    user: UserEntity,
  ) {
    const {
      page = 1,
      take = 10,
      orderBy = GetClientSubcategoryOrderEnum.createdAt,
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
          'basketProduct',
          'basketProduct.userId = :userId',
          { userId: user.id },
        );
    }

    productQuery
      .select([
        'products.id',
        'products.article',
        'products.commodity',
        'products.barcode',
        'products.currentSaleQuantity',
        'products.createdAt',
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
        user ? 'likedProducts.productId' : 'NULL as likedProductId',
        user ? 'basketProduct.productId' : 'NULL as basketProductId',
      ])

      .where(
        'products.subcategoryId = :subcategoryId AND productAttributes.language = :language  AND prices.userType = :userType AND productAttributes.id IS NOT NULL AND medias.id IS NOT NULL AND prices.price IS NOT NULL',
        {
          subcategoryId: subcategoryId,
          language: lng,
          userType: userType || 'user',
        },
      )
      .andWhere(
        new Brackets((qb) => {
          qb.where('productAttributes.title ILIKE :search', {
            search: `%${search}%`,
          })
            .orWhere('products.article ILIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('products.barcode ILIKE :search', {
              search: `%${search}%`,
            });
        }),
      )
      .take(take)
      .skip((page - 1) * take);

    if (query.commodity) {
      productQuery.andWhere('products.commodity = :commodity', {
        commodity: query.commodity,
      });
    }

    if (query.orderBy === GetClientSubcategoryOrderEnum.price) {
      productQuery.orderBy(`prices.${orderBy}`, order);
    }

    if (query.orderBy === GetClientSubcategoryOrderEnum.popularity) {
      productQuery.orderBy(`products.${orderBy}`, order);
    }

    const [products, count] = await productQuery.getManyAndCount();

    return {
      products: products,
      productsCount: count,
    };
  }

  async getSubcategoriesByCategory(
    categoryId: string,
    query: GetClientSubcategoryDto,
    currentUser?: UserEntity,
  ) {
    const {
      page = 1,
      take = 10,
      orderBy = GetClientSubcategoryOrderEnum.createdAt,
      order = OrderType.ASC,
      search = '',
      lng = LngEnum.tkm,
    } = query;

    const userType = currentUser ? currentUser.role : 'user';

    const subcategoryProductsQuery = this.productRepository
      .createQueryBuilder('products')
      .leftJoin('products.subcategory', 'subcategory')
      .leftJoin('subcategory.category', 'category')
      .leftJoin('products.productAttributes', 'productAttributes')
      .leftJoin('products.medias', 'medias')
      .leftJoin('products.prices', 'prices');

    if (currentUser) {
      subcategoryProductsQuery
        .leftJoinAndSelect(
          'products.likedProducts',
          'likedProducts',
          'likedProducts.userId = :userId',
          { userId: currentUser.id },
        )
        .leftJoinAndSelect(
          'products.basketProduct',
          'basketProduct',
          'basketProduct.userId = :userId',
          { userId: currentUser.id },
        );
    }

    subcategoryProductsQuery
      .select([
        'products.id',
        'products.article',
        'products.commodity',
        'products.barcode',
        'products.currentSaleQuantity',
        'products.createdAt',
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
        currentUser ? 'likedProducts.productId' : 'NULL as likedProductId',
        currentUser ? 'basketProduct.productId' : 'NULL as basketProductId',
      ])

      .where(
        'subcategory.categoryId = :categoryId AND productAttributes.language = :language  AND prices.userType = :userType AND productAttributes.id IS NOT NULL AND medias.id IS NOT NULL AND prices.price IS NOT NULL',
        {
          categoryId: categoryId,
          language: lng,
          userType: userType || 'user',
        },
      )
      .andWhere(
        new Brackets((qb) => {
          qb.where('productAttributes.title ILIKE :search', {
            search: `%${search}%`,
          })
            .orWhere('products.article ILIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('products.barcode ILIKE :search', {
              search: `%${search}%`,
            });
        }),
      )
      .take(take)
      .skip((page - 1) * take);

    if (query.commodity) {
      subcategoryProductsQuery.andWhere('products.commodity = :commodity', {
        commodity: query.commodity,
      });
    }

    if (query.orderBy === GetClientSubcategoryOrderEnum.price) {
      subcategoryProductsQuery.orderBy(`prices.${orderBy}`, order);
    }

    if (query.orderBy === GetClientSubcategoryOrderEnum.popularity) {
      subcategoryProductsQuery.orderBy(`products.${orderBy}`, order);
    }

    const [subcategoryProducts, count] =
      await subcategoryProductsQuery.getManyAndCount();

    return {
      subcategoryProducts: subcategoryProducts,
      productsCount: count,
    };
  }
}
