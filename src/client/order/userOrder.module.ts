import { Module } from '@nestjs/common';
import { UserOrderService } from './userOrder.service';
import { UserOrderController } from './userOrder.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './entities/order.entity';
import { OrderProductsEntity } from './entities/orderProducts.entity';
import { UserBasketModule } from '../basket/basket.module';
import { TokenModule } from '../user/token/userToken.module';
import { UserModule } from '../user/users/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [OrderEntity, OrderProductsEntity],
      ),
      TokenModule,
      UserModule,
    UserBasketModule,
  ],
  controllers: [UserOrderController],
  providers: [UserOrderService],
})
export class UserOrderModule {}
