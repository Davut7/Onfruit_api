import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from 'src/admin/stock/category/entities/category.entity';
import { ClientCategoryController } from './clientCategory.controller';
import { ClientCategoryService } from './clientCategory.service';
import { ClientSubcategoryModule } from '../subcategory/clientSubcategory.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([CategoryEntity]),
    ClientSubcategoryModule,
  ],
  controllers: [ClientCategoryController],
  providers: [ClientCategoryService],
})
export class ClientCategoryModule {}
