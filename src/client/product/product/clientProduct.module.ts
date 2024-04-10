import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from 'src/admin/stock/product/entities/product.entity';
import { UserEntity } from 'src/client/user/users/entities/user.entity';
import { UserModule } from 'src/client/user/users/user.module';
import { ClientProductController } from './clientProduct.controller';
import { ClientProductService } from './clientProduct.service';
import { TokenModule } from 'src/client/user/token/userToken.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductEntity, UserEntity]),
    TokenModule,
    UserModule,
    RedisModule,
  ],
  controllers: [ClientProductController],
  providers: [ClientProductService],
  exports: [ClientProductService],
})
export class ClientProductModule {}
