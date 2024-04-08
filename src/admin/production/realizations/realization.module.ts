import { Module } from '@nestjs/common';
import { RealizationService } from './realization.service';
import { RealizationController } from './realization.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RealizationEntity } from './entities/realizations.entity';
import { ProductModule } from 'src/admin/stock/product/product.module';
import { RealizationPriceEntity } from '../realizationPrices/entities/realizationPrices.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RealizationEntity, RealizationPriceEntity]),
    ProductModule,
  ],
  controllers: [RealizationController],
  providers: [RealizationService],
})
export class RealizationModule {}
