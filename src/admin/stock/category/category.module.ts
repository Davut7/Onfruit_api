import { Module, forwardRef } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryEntity } from './entities/category.entity';
import { SubcategoryModule } from '../subcategory/subcategory.module';
import { CategoryService } from './category.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageTransformer } from 'src/helpers/pipes/image.transform';
import { AbilityControlModule } from 'src/admin/abilityControl/abilityControl.module';
import { MediaModule } from 'src/media/media.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CategoryEntity]),
    forwardRef(() => SubcategoryModule),
    AbilityControlModule,
    MediaModule,
    RedisModule,
  ],
  controllers: [CategoryController],
  providers: [CategoryService, ImageTransformer],
  exports: [CategoryService],
})
export class CategoryModule {}
