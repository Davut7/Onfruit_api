import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/users/user.module';
import { UserEntity } from '../user/users/entities/user.entity';
import { FavoriteListEntity } from './entities/favoriteLists.entity';
import { FavoriteListProductsEntity } from './entities/favoriteListProducts.entity';
import { TokenModule } from '../user/token/userToken.module';
import { ClientProductModule } from '../product/product/clientProduct.module';
import { FavoriteListsController } from './favoriteLists.controller';
import { FavoriteListsService } from './favoriteLists.service';
import { ProductEntity } from 'src/admin/stock/product/entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FavoriteListEntity,
      FavoriteListProductsEntity,
      UserEntity,
      ProductEntity,
    ]),
    TokenModule,
    UserModule,
    ClientProductModule,
  ],
  controllers: [FavoriteListsController],
  providers: [FavoriteListsService],
})
export class FavoriteListsModule {}
