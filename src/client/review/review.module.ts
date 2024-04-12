import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewEntity } from './entities/review.entity';
import { UserOrderModule } from '../order/userOrder.module';
import { ProductEntity } from 'src/admin/stock/product/entities/product.entity';
import { TokenModule } from '../user/token/userToken.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReviewEntity, ProductEntity]),
    UserOrderModule,
    TokenModule,
    RedisModule,
  ],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
