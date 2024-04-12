import { PickType } from '@nestjs/swagger';
import { ReviewEntity } from '../entities/review.entity';

export class CreateProductReview extends PickType(ReviewEntity, [
  'review',
  'star',
] as const) {}
