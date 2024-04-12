import { Module } from '@nestjs/common';
import { DiscountService } from './discount.service';
import { DiscountController } from './discount.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscountEntity } from './entities/discount.entity';
import { ProductEntity } from '../stock/product/entities/product.entity';
import { RedisModule } from 'src/redis/redis.module';
import { AbilityControlModule } from '../abilityControl/abilityControl.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DiscountEntity, ProductEntity]),
    RedisModule,
    AbilityControlModule,
  ],
  providers: [DiscountService],
  controllers: [DiscountController],
})
export class DiscountModule {}
