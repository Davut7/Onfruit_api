import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from 'src/client/order/entities/order.entity';
import { AbilityControlModule } from '../abilityControl/abilityControl.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity]),
    AbilityControlModule,
    RedisModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
