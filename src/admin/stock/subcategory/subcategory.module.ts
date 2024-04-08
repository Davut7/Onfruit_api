import { Module, forwardRef } from '@nestjs/common';
import { SubcategoryEntity } from './entities/subcategory.entity';
import { SubcategoryController } from './subcategory.controller';
import { SubcategoryService } from './subcategory.service';
import { CategoryModule } from '../category/category.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from '../product/product.module';
import { AbilityControlModule } from 'src/admin/abilityControl/abilityControl.module';
import { ImageTransformer } from 'src/helpers/pipes/image.transform';
import { MediaModule } from 'src/media/media.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SubcategoryEntity]),
    forwardRef(() => CategoryModule),
    forwardRef(() => ProductModule),
    AbilityControlModule,
    MediaModule,
  ],
  controllers: [SubcategoryController],
  providers: [SubcategoryService, ImageTransformer],
  exports: [SubcategoryService],
})
export class SubcategoryModule {}
