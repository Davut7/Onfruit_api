import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/users/entities/user.entity';
import { UserModule } from '../user/users/user.module';
import { LikedProductsEntity } from './entities/likedProducts.entity';
import { ClientProductModule } from '../product/product/clientProduct.module';
import { TokenModule } from '../user/token/userToken.module';
import { LikedProductsController } from './likedProducts.controller';
import { LikedProductsService } from './likedProducts.service';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, LikedProductsEntity]),
    TokenModule,
    ClientProductModule,
    UserModule,
    RedisModule,
  ],
  controllers: [LikedProductsController],
  providers: [LikedProductsService],
})
export class LikedProductsModule {}
