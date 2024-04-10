import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from '../product/product.module';
import { AbilityControlModule } from 'src/admin/abilityControl/abilityControl.module';
import { ProductAttributesEntity } from './entities/productAttributes.entity';
import { ProductAttributesController } from './productAttributes.controller';
import { ProductAttributesService } from './productAttributes.service';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductAttributesEntity]),
    forwardRef(() => ProductModule),
    AbilityControlModule,
    RedisModule,
  ],
  controllers: [ProductAttributesController],
  providers: [ProductAttributesService],
  exports: [ProductAttributesService],
})
export class ProductAttributesModule {}
