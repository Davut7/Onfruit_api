import { Module, forwardRef } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ProductEntity } from './entities/product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubcategoryModule } from '../subcategory/subcategory.module';
import { ArrivalModule } from '../arrivals/arrival.module';
import { ManufacturerCountriesEntity } from './entities/countries.entity';
import { AbilityControlModule } from 'src/admin/abilityControl/abilityControl.module';
import { ProductAttributesModule } from '../productAttributes/productAttributes.module';
import { MediaModule } from 'src/media/media.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductEntity, ManufacturerCountriesEntity]),
    forwardRef(() => SubcategoryModule),
    forwardRef(() => ArrivalModule),
    forwardRef(() => ProductAttributesModule),
    AbilityControlModule,
    MediaModule,
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
