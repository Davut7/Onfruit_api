import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/users/entities/user.entity';
import { FavoriteListEntity } from './entities/favoriteLists.entity';
import { FavoriteListProductsEntity } from './entities/favoriteListProducts.entity';
import { UpdateFavoriteListProductDto } from './dto/updateFavoriteListProduct.dto';
import { GetOneFavoriteListFilter } from './dto/getOneFavoriteList.dto';
import { CreateFavoriteListDto } from './dto/createFavoriteList.dto';
import { UpdateFavoriteListDto } from './dto/updateFavoriteList.dto';
import { GetOneFavoriteListOrderEnum, OrderType } from 'src/helpers/constants';
import { ProductEntity } from 'src/admin/stock/product/entities/product.entity';

@Injectable()
export class FavoriteListsService {
  private readonly logger = new Logger(FavoriteListsService.name);
  constructor(
    @InjectRepository(FavoriteListEntity)
    private favoriteListRepository: Repository<FavoriteListEntity>,
    @InjectRepository(FavoriteListProductsEntity)
    private favoriteListProductsRepository: Repository<FavoriteListProductsEntity>,
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
  ) {}

  async createFavoriteList(
    dto: CreateFavoriteListDto,
    currentUser: UserEntity,
  ) {
    this.logger.log(`Creating favorite list: ${JSON.stringify(dto, null, 2)}`);
    const candidate = await this.favoriteListRepository.findOne({
      where: { title: dto.title },
    });

    if (candidate)
      throw new BadRequestException(
        'Favorite list with title ' + candidate.title + 'already exists',
      );

    const favoriteList = this.favoriteListRepository.create({
      ...dto,
      userId: currentUser.id,
    });

    await this.favoriteListRepository.save(favoriteList);

    this.logger.log(`Favorite list created successfully!`);
    return {
      message: 'Favorite list created successfully',
      favoriteList: favoriteList,
    };
  }

  async getFavoriteLists(user: UserEntity) {
    this.logger.log(`Finding all favorite lists for user with id ${user.id}`);
    const favoriteLists = await this.favoriteListRepository
      .createQueryBuilder('favoriteList')
      .leftJoinAndSelect('favoriteList.favoriteProducts', 'favoriteProducts')
      .where('favoriteList.userId = :userId', { userId: user.id })
      .select([
        'favoriteList.id as id',
        'COUNT(favoriteProducts.id) as "listProductsCount"',
        'SUM(favoriteProducts.productSum) as "productSum"',
      ])
      .groupBy('favoriteList.id')
      .getRawMany();

    this.logger.log(`All favorite lists returned successfully!`);
    return {
      message: 'Favorite list retrieved successfully',
      favoriteLists: favoriteLists,
      favoriteListCount: favoriteLists.length,
    };
  }

  async getOneFavoriteList(
    favoriteListId: string,
    query?: GetOneFavoriteListFilter,
    user?: UserEntity,
  ) {
    this.logger.log(`Finding favorite list with id ${favoriteListId}`);
    const favoriteList = await this.favoriteListRepository
      .createQueryBuilder('favoriteList')
      .leftJoin('favoriteList.favoriteProducts', 'favoriteProducts')
      .where('favoriteList.id = :favoriteListId', {
        favoriteListId: favoriteListId,
      })
      .select([
        'favoriteList.id as id',
        'COUNT(favoriteProducts.id) as "listProductsCount"',
        'SUM(favoriteProducts.productSum) as "productSum"',
      ])
      .groupBy('favoriteList.id')
      .getRawOne();

    const { favoriteProducts, favoriteProductCount } =
      await this.getProductsByListId(favoriteListId, query, user);

    if (!favoriteList) throw new NotFoundException('Favorites not found');

    this.logger.log(
      `Favorite list with id ${favoriteListId} returned successfully!`,
    );
    return {
      message: `Favorite List returned id ${favoriteList.id}`,
      favoriteList: favoriteList,
      favoriteListProducts: favoriteProducts,
      favoriteProductCount: favoriteProductCount,
    };
  }

  async updateFavoriteList(favoriteListId: string, dto: UpdateFavoriteListDto) {
    this.logger.log(`Updating favorite list with id ${favoriteListId}`);
    const favoriteList = await this.getFavoriteListById(favoriteListId);

    Object.assign(favoriteList, dto);

    await this.favoriteListRepository.save(favoriteList);

    this.logger.log(
      `Favorite list with id ${favoriteListId} updated successfully!`,
    );
    return {
      message: `Favorite List updated id ${favoriteListId}`,
      favoriteList: favoriteList,
    };
  }

  async deleteFavoriteList(favoriteListId: string) {
    this.logger.log(`Deleting favorite list with id ${favoriteListId}`);
    const favoriteList = await this.getFavoriteListById(favoriteListId);

    await this.favoriteListRepository.delete(favoriteList.id);

    this.logger.log(
      `Favorite list with id ${favoriteListId} deleted successfully!`,
    );
    return {
      message: `Favorite List deleted id ${favoriteListId}`,
    };
  }

  async addProductToFavoriteList(favoriteListId: string, productId: string) {
    this.logger.log(
      `Adding product with id ${productId} to favorite list with id ${favoriteListId}`,
    );
    const product = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.prices', 'price')
      .where('product.id = :productId', { productId })
      .getOne();

    if (!product) throw new NotFoundException('Product not found');

    const candidate = await this.favoriteListProductsRepository.findOne({
      where: { productId: productId },
    });

    if (candidate)
      throw new NotFoundException('Product already in favorite list');

    const maxPrice = product.prices
      .map((price) => price.price)
      .reduce((max, currentPrice) => Math.max(max, currentPrice), -Infinity);

    const favoriteListProduct = this.favoriteListProductsRepository.create({
      productId: productId,
      productPrice: maxPrice,
      productQuantity: 1,
      productSum: maxPrice,
      favoriteListId: favoriteListId,
    });

    await this.favoriteListProductsRepository.save(favoriteListProduct);

    this.logger.log(`Product added to favorite list successfully!`);
    return {
      message: 'Product added successfully',
      favoriteListProduct: favoriteListProduct,
    };
  }

  async getOneFavoriteListProduct(favoriteListProductId: string) {
    this.logger.log(
      `Finding favorite list product with id ${favoriteListProductId}`,
    );
    const favoriteListProduct =
      await this.favoriteListProductsRepository.findOne({
        where: { id: favoriteListProductId },
      });

    if (!favoriteListProduct) {
      this.logger.log(
        `Favorite list product with id ${favoriteListProductId} not found!`,
      );
      throw new NotFoundException('Favorite lis product  not found!');
    }

    this.logger.log(
      `Favorite list product with id ${favoriteListProductId} found successfully!`,
    );
    return favoriteListProduct;
  }

  async removeProductFromFavoriteList(favoriteListProductId: string) {
    this.logger.log(
      `Removing product from favorite list with id ${favoriteListProductId}`,
    );
    const favoriteListProduct = await this.getOneFavoriteListProduct(
      favoriteListProductId,
    );

    await this.favoriteListProductsRepository.delete(favoriteListProduct.id);

    this.logger.log(`Product removed from favorite list successfully!`);
    return { message: 'Product removed successfully' };
  }

  async updateFavoriteListProduct(
    favoriteListProductId: string,
    dto: UpdateFavoriteListProductDto,
  ) {
    this.logger.log(
      `Updating favorite list product with id ${favoriteListProductId}`,
    );
    const favoriteListProduct = await this.getOneFavoriteListProduct(
      favoriteListProductId,
    );

    const product = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.prices', 'price')
      .where('product.id = :productId', {
        productId: favoriteListProduct.productId,
      })
      .getOne();
    let selectedPrice;
    for (const price of product.prices) {
      if (favoriteListProduct.productQuantity >= price.quantity) {
        selectedPrice = price;
      }
    }

    if (!selectedPrice) {
      selectedPrice = favoriteListProduct.productPrice;

      favoriteListProduct.productPrice = selectedPrice;
      favoriteListProduct.productQuantity += dto.quantityUpdate;
      favoriteListProduct.productSum =
        favoriteListProduct.productQuantity * selectedPrice;
      if (favoriteListProduct.productQuantity <= 0)
        throw new BadRequestException('Quantity cannot be less than 1.');
      if (favoriteListProduct.productQuantity >= product.currentSaleQuantity)
        throw new BadRequestException(
          'Cannot add quantity more than current sale quantity ',
        );
      await this.favoriteListProductsRepository.save(favoriteListProduct);

      return {
        product: favoriteListProduct,
        message: 'Basket product data updated successfully!',
      };
    }

    if (favoriteListProduct.productQuantity <= 0)
      throw new BadRequestException('Quantity cannot be less than 1.');

    if (favoriteListProduct.productQuantity >= product.currentSaleQuantity)
      throw new BadRequestException(
        `Cannot add quantity more than current sale quantity ${product.currentSaleQuantity}`,
      );
    favoriteListProduct.productPrice = selectedPrice.price;
    favoriteListProduct.productQuantity += dto.quantityUpdate;
    favoriteListProduct.productSum =
      favoriteListProduct.productQuantity * selectedPrice.price;

    await this.favoriteListProductsRepository.save(favoriteListProduct);

    this.logger.log(
      `Favorite list product with id ${favoriteListProductId} updated successfully!`,
    );

    return {
      favoriteListProduct: favoriteListProduct,
      message: `Favorite list product with id ${favoriteListProductId} updated successfully!`,
    };
  }

  async getFavoriteListById(favoriteListId: string) {
    const favoriteList = await this.favoriteListRepository.findOne({
      where: { id: favoriteListId },
    });
    if (!favoriteList)
      throw new NotFoundException(`Favorite list with id ${favoriteListId}`);
    return favoriteList;
  }

  async getProductsByListId(
    favoriteListId: string,
    query: GetOneFavoriteListFilter,
    user: UserEntity,
  ) {
    this.logger.log(
      `Finding products for favorite list with id ${favoriteListId}`,
    );
    const {
      orderBy = GetOneFavoriteListOrderEnum.price,
      order = OrderType.ASC,
      take = 10,
      page = 1,
    } = query;

    const favoriteListQuery = this.favoriteListProductsRepository
      .createQueryBuilder('favoriteListProducts')
      .leftJoin('favoriteListProducts.product', 'products')
      .leftJoin('products.productAttributes', 'productAttributes')
      .leftJoin('products.medias', 'medias')
      .leftJoin('products.prices', 'prices')
      .where('favoriteListProducts.favoriteListId = :favoriteListId', {
        favoriteListId: favoriteListId,
      })
      .andWhere(
        'productAttributes.language = :lng AND prices.userType = :userType',
        { lng: query.lng, userType: user.role },
      )
      .select([
        'favoriteListProducts.id',
        'favoriteListProducts.productQuantity',
        'favoriteListProducts.productSum',
        'favoriteListProducts.createdAt as createdAt',
        'products.id',
        'products.article',
        'products.barcode',
        'products.commodity',
        'products.currentSaleQuantity',
        'productAttributes.id',
        'productAttributes.title',
        'productAttributes.language',
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
      .take(take)
      .skip((page - 1) * take)
      .orderBy(`"${orderBy}"`, order);

    if (orderBy === 'price')
      favoriteListQuery.orderBy(`prices.${orderBy}`, order);

    if (query.commodity)
      favoriteListQuery.andWhere('products.commodity = :commodity', {
        commodity: query.commodity,
      });

    const [favoriteProduct, count] = await favoriteListQuery.getManyAndCount();

    this.logger.log(
      `Products for favorite list with id ${favoriteListId} found successfully!`,
    );
    return {
      favoriteProducts: favoriteProduct,
      favoriteProductCount: count,
    };
  }
}
