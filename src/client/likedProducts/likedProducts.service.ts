import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/users/entities/user.entity';
import { LikedProductsEntity } from './entities/likedProducts.entity';
import { ClientProductService } from '../product/product/clientProduct.service';
import { GetLikedProductsDto } from './dto/getLikedProducts.dto';

@Injectable()
export class LikedProductsService {
  constructor(
    @InjectRepository(LikedProductsEntity)
    private likedProductsRepository: Repository<LikedProductsEntity>,
    private clientProductService: ClientProductService,
  ) {}

  async createLikedProduct(userId: string, productId: string) {
    await this.clientProductService.getByProductId(productId);

    const candidate = await this.likedProductsRepository.findOne({
      where: { userId: userId, productId: productId },
    });
    if (candidate)
      throw new NotFoundException(
        `You already have this product in liked list`,
      );

    const basketProduct = this.likedProductsRepository.create({
      userId: userId,
      productId: productId,
    });

    await this.likedProductsRepository.save(basketProduct);
    return {
      message: 'Product added to liked list successfully!',
      basketProduct: basketProduct,
    };
  }

  async getLikedProducts(currentUser: UserEntity, query: GetLikedProductsDto) {
    const { lng = 'tkm', take = 10, page = 1 } = query;

    const likedProductsQuery = this.likedProductsRepository
      .createQueryBuilder('likedProducts')
      .leftJoin('likedProducts.product', 'product')
      .leftJoin('product.productAttributes', 'productAttributes')
      .leftJoin('product.medias', 'medias')
      .leftJoin('product.prices', 'prices')
      .where('likedProducts.userId = :userId', { userId: currentUser.id })
      .select([
        'likedProducts.id',
        'likedProducts.createdAt',
        'product.id',
        'product.article',
        'product.commodity',
        'product.currentSaleQuantity',
        'productAttributes.id',
        'productAttributes.title',
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
      ])
      .where(
        'productAttributes.language = :lng AND prices.userType = :userType AND productAttributes.id IS NOT NULL AND medias.id IS NOT NULL AND prices.price IS NOT NULL AND product.currentSaleQuantity > 0 ',
        { lng, userType: currentUser.role },
      )
      .take(take)
      .skip((page - 1) * take);

    if (query.commodity)
      likedProductsQuery.andWhere('product.commodity = :commodity', {
        commodity: query.commodity,
      });
    const [products, count] = await likedProductsQuery.getManyAndCount();
    if (!products) return { message: 'You do not have liked products yet.' };
    return {
      products: products,
      productsCount: count,
      message: 'Liked products returned successfully!',
    };
  }

  private async getOneLikedProduct(likedProductId: string, userId: string) {
    const likedProduct = await this.likedProductsRepository.findOne({
      where: { id: likedProductId, userId: userId },
    });
    return likedProduct;
  }

  async deleteLikedProduct(likedProductId: string, userId: string) {
    const candidate = await this.getOneLikedProduct(likedProductId, userId);
    if (!candidate)
      throw new NotFoundException(
        `Liked product with product id ${likedProductId} not found!`,
      );
    const likedProduct = await this.likedProductsRepository.delete({
      userId: userId,
      id: likedProductId,
    });
    return {
      message: 'Liked product deleted successfully!',
    };
  }
}
