import { Module } from '@nestjs/common';
import { UserBasketService } from './basket.service';
import { UserBasketController } from './basket.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/users/user.module';
import { ClientProductModule } from '../product/product/clientProduct.module';
import { TokenModule } from '../user/token/userToken.module';
import { BasketEntity } from './entities/basket.entity';
import { ProductEntity } from 'src/admin/stock/product/entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BasketEntity, ProductEntity]),
    ClientProductModule,
    TokenModule,
    UserModule,
  ],
  controllers: [UserBasketController],
  providers: [UserBasketService],
  exports: [UserBasketService],
})
export class UserBasketModule {}
