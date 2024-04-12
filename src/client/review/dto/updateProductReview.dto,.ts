import { PartialType } from '@nestjs/swagger';
import { CreateProductReview } from './createProductReview.dto';

export class UpdateProductReview extends PartialType(CreateProductReview) {}
