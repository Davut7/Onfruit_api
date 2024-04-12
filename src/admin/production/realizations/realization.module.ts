import { Module } from '@nestjs/common';
import { RealizationService } from './realization.service';
import { RealizationController } from './realization.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RealizationEntity } from './entities/realizations.entity';
import { ProductModule } from 'src/admin/stock/product/product.module';
import { RealizationPriceEntity } from '../realizationPrices/entities/realizationPrices.entity';
import { AbilityControlModule } from 'src/admin/abilityControl/abilityControl.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RealizationEntity, RealizationPriceEntity]),
    ProductModule, AbilityControlModule, RedisModule
  ],
  controllers: [RealizationController],
  providers: [RealizationService],
})
export class RealizationModule {}
