import { Module, forwardRef } from '@nestjs/common';
import { ArrivalController } from './arrival.controller';
import { ArrivalService } from './arrival.service';
import { ArrivalEntity } from './entities/arrival.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from '../product/product.module';
import { AbilityControlModule } from 'src/admin/abilityControl/abilityControl.module';
import { ProductEntity } from '../product/entities/product.entity';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ArrivalEntity, ProductEntity]),
    forwardRef(() => ProductModule),
    AbilityControlModule,
    RedisModule,
  ],
  controllers: [ArrivalController],
  providers: [ArrivalService],
  exports: [ArrivalService],
})
export class ArrivalModule {}
