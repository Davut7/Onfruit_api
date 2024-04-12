import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewEntity } from './entities/review.entity';
import { UserOrderService } from '../order/userOrder.service';
import { UserTokenDto } from '../user/token/dto/userToken.dto';
import {
  GetReviewsEnum,
  LngEnum,
  OrderStatus,
  OrderType,
} from 'src/helpers/constants';
import { ProductEntity } from 'src/admin/stock/product/entities/product.entity';
import { CreateProductReview } from './dto/createProductReview.dto';
import { GetReviewsQuery } from './dto/getReviewsQuery';
import { UpdateProductReview } from './dto/updateProductReview.dto,';

@Injectable()
export class ReviewService {
  private readonly logger = new Logger(ReviewService.name);

  constructor(
    @InjectRepository(ReviewEntity)
    private reviewRepository: Repository<ReviewEntity>,
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
    private orderService: UserOrderService,
  ) {}

  async reviewProduct(
    currentUser: UserTokenDto,
    productId: string,
    orderId: string,
    dto: CreateProductReview,
  ) {
    // Log a message indicating that a product review is being created
    this.logger.log(
      `Creating product review for user ${currentUser.id} on product ${productId} in order ${orderId}`,
    );

    const order = await this.orderService.getOneOrder(orderId, currentUser);
    if (order.status !== OrderStatus.DELIVERED) {
      throw new BadRequestException(
        'Order not delivered yet, so you can review the product',
      );
    }
    await this.orderService.getOneOrderProduct(orderId, productId);

    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');
    const isReviewed = await this.reviewRepository.findOne({
      where: { userId: currentUser.id, productId: productId },
    });
    if (isReviewed)
      throw new ConflictException(
        'You already have a review about this product',
      );
    const review = this.reviewRepository.create({
      ...dto,
      productId: productId,
      userId: currentUser.id,
    });
    await this.reviewRepository.save(review);
    return {
      message: 'Product review created successfully',
      review: review,
    };
  }

  async getReviewProducts(currentUser: UserTokenDto, query?: GetReviewsQuery) {
    // Log a message indicating that review products are being retrieved
    this.logger.log(`Retrieving review products for user ${currentUser.id}`);

    const {
      lng = LngEnum.ru,
      take = 10,
      page = 1,
      orderBy = GetReviewsEnum.createdAt,
      order = OrderType.ASC,
    } = query;

    const [reviews, reviewsCount] = await this.reviewRepository
      .createQueryBuilder('reviews')
      .leftJoinAndSelect('reviews.product', 'product')
      .leftJoinAndSelect('reviews.user', 'user')
      .leftJoinAndSelect('product.medias', 'medias')
      .leftJoinAndSelect('product.productAttributes', 'productAttributes')
      .leftJoinAndSelect('product.realizations', 'realizations')
      .leftJoinAndSelect('product.prices', 'prices')
      .where('reviews.userId = :userId', { userId: currentUser.id })
      .andWhere('productAttributes.language = :language', { language: lng })
      .take(take)
      .skip((page - 1) * take)
      .orderBy(`reviews.${orderBy}`, order)
      .getManyAndCount();

    return {
      reviews: reviews,
      reviewsCount: reviewsCount,
    };
  }

  async deleteReview(reviewId: string, currentUser: UserTokenDto) {
    const review = await this.getOneReview(reviewId, currentUser);
    await this.reviewRepository.delete(review.id);
    return {
      message: 'Review deleted successfully',
      review: review,
    };
  }

  async updateReview(
    dto: UpdateProductReview,
    reviewId: string,
    currentUser: UserTokenDto,
  ) {
    const review = await this.getOneReview(reviewId, currentUser);

    Object.assign(review, dto);

    await this.reviewRepository.save(review);
    return {
      messagE: 'Review updated successfully',
      review: review,
    };
  }

  async getOneReview(reviewId: string, currentUser: UserTokenDto) {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId, userId: currentUser.id },
    });
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }
}
