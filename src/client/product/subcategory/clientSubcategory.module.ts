import { Module } from '@nestjs/common';
import { ClientSubcategoryService } from './clientSubcategory.service';
import { ClientSubcategoryController } from './clientSubcategory.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubcategoryEntity } from 'src/admin/stock/subcategory/entities/subcategory.entity';
import { ProductEntity } from 'src/admin/stock/product/entities/product.entity';
import { UserEntity } from 'src/client/user/users/entities/user.entity';
import { UserModule } from 'src/client/user/users/user.module';
import { TokenModule } from 'src/client/user/token/userToken.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SubcategoryEntity, ProductEntity, UserEntity]),
    TokenModule,
    UserModule,
  ],
  controllers: [ClientSubcategoryController],
  providers: [ClientSubcategoryService],
  exports: [ClientSubcategoryService],
})
export class ClientSubcategoryModule {}
