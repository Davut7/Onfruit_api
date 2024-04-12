import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { CreateProductReview } from './dto/createProductReview.dto';
import { GetReviewsQuery } from './dto/getReviewsQuery';
import { ReviewService } from './review.service';
import { ClientAuthGuard } from 'src/helpers/guards/clientAuthGuard.guard';
import { CurrentUser } from '../../helpers/common/decorators/currentUser.decorator';
import { UserTokenDto } from '../user/token/dto/userToken.dto';
import { UpdateProductReview } from './dto/updateProductReview.dto,';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @ApiOperation({ summary: 'Review a product' })
  @ApiConflictResponse({
    description: 'You already have a review about this product',
  })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiBadRequestResponse({
    description: 'Order not delivered yet, so you cannot review the product',
  })
  @ApiOkResponse({ description: 'Product review created successfully' })
  @UseGuards(ClientAuthGuard)
  @Post(':productId/order/:orderId')
  async reviewProduct(
    @Body() dto: CreateProductReview,
    @Param('productId') productId: string,
    @Param('orderId') orderId: string,
    @CurrentUser() currentUser: UserTokenDto,
  ) {
    return this.reviewService.reviewProduct(
      currentUser,
      productId,
      orderId,
      dto,
    );
  }

  @ApiOperation({ summary: 'Get reviews for products' })
  @ApiOkResponse({ description: 'Reviews retrieved successfully' })
  @UseGuards(ClientAuthGuard)
  @Get()
  async getReviewProducts(
    @CurrentUser() currentUser: UserTokenDto,
    @Query() query: GetReviewsQuery,
  ) {
    return this.reviewService.getReviewProducts(currentUser, query);
  }

  @ApiOperation({ summary: 'Delete a review' })
  @ApiOkResponse({ description: 'Review deleted successfully' })
  @ApiNotFoundResponse({ description: 'Review not found' })
  @UseGuards(ClientAuthGuard)
  @Delete(':reviewId')
  async deleteReview(
    @Param('reviewId') reviewId: string,
    @CurrentUser() currentUser: UserTokenDto,
  ) {
    return this.reviewService.deleteReview(reviewId, currentUser);
  }

  @ApiOperation({ summary: 'Update a review' })
  @ApiOkResponse({ description: 'Review updated successfully' })
  @ApiNotFoundResponse({ description: 'Review not found' })
  @UseGuards(ClientAuthGuard)
  @Patch(':reviewId')
  async updateReview(
    @Body() dto: UpdateProductReview,
    @Param('reviewId') reviewId: string,
    @CurrentUser() currentUser: UserTokenDto,
  ) {
    return this.reviewService.updateReview(dto, reviewId, currentUser);
  }
}
