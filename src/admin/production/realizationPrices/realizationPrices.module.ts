import { Module } from '@nestjs/common';
import { RealizationPricesService } from './realizationPrices.service';
import { RealizationPricesController } from './realizationPrices.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RealizationPriceEntity } from './entities/realizationPrices.entity';
import { ProductModule } from 'src/admin/stock/product/product.module';

@Module({
  imports: [TypeOrmModule.forFeature([RealizationPriceEntity]), ProductModule],
  controllers: [RealizationPricesController],
  providers: [RealizationPricesService],
})
export class RealizationPricesModule {}
