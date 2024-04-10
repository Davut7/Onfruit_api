import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './client/user/users/user.module';
import { ClientAddressModule } from './client/user/address/address.module';
import { ProductModule } from './admin/stock/product/product.module';
import { CategoryModule } from './admin/stock/category/category.module';
import { SubcategoryModule } from './admin/stock/subcategory/subcategory.module';
import { EmployeeModule } from './admin/employee/employee.module';
import { ArrivalModule } from './admin/stock/arrivals/arrival.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './core/all-exceptions.filter';
import { RealizationModule } from './admin/production/realizations/realization.module';
import { MinioService } from './minio/minio.service';
import { MinioModule } from './minio/minio.module';
import DatabaseLogger from './helpers/log/databaseLogger';
import { LoggerModule } from './admin/logger/logger.module';
import { LogsMiddleware } from './helpers/middleware/logs.middleware';
import { AdminAuthModule } from './admin/systemUsers/auth/auth.module';
import { AdminTokenModule } from './admin/systemUsers/token/token.module';
import { AdminUsersModule } from './admin/systemUsers/user/users.module';
import { AbilityControlModule } from './admin/abilityControl/abilityControl.module';
import { ProductAttributesModule } from './admin/stock/productAttributes/productAttributes.module';
import { RealizationPricesModule } from './admin/production/realizationPrices/realizationPrices.module';
import { LikedProductsModule } from './client/likedProducts/likedProducts.module';
import { TokenModule } from './client/user/token/userToken.module';
import { ClientAuthModule } from './client/user/auth/userAuth.module';
import { ClientCategoryModule } from './client/product/category/clientCategory.module';
import { ClientSubcategoryModule } from './client/product/subcategory/clientSubcategory.module';
import { ClientProductModule } from './client/product/product/clientProduct.module';
import { FavoriteListsModule } from './client/favoriteList/favoriteLists.module';
import { UserOrderModule } from './client/order/userOrder.module';
import { UserBasketModule } from './client/basket/basket.module';
import { MediaModule } from './media/media.module';
import { ReviewModule } from './client/review/review.module';
import { BannerModule } from './admin/banner/banner.module';
import { DiscountModule } from './admin/discount/discount.module';
import { OrderModule } from './admin/order/order.module';
import { AnalyticsModule } from './admin/analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: `.${process.env.NODE_ENV}.env` }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: ['entity/**/.entities.ts'],
      migrations: ['src/migrations/*.ts'],
      migrationsTableName: 'custom_migration_table',
      autoLoadEntities: true,
      synchronize: true,
      logger: new DatabaseLogger(),
    }),
    UserModule,
    TokenModule,
    ClientAuthModule,
    ClientAddressModule,
    CategoryModule,
    SubcategoryModule,
    ProductModule,
    LikedProductsModule,
    EmployeeModule,
    AdminAuthModule,
    AdminTokenModule,
    ArrivalModule,
    AdminUsersModule,
    ProductAttributesModule,
    RealizationModule,
    LoggerModule,
    RealizationPricesModule,
    MinioModule,
    ClientCategoryModule,
    ClientSubcategoryModule,
    MediaModule,
    AbilityControlModule,
    ClientProductModule,
    FavoriteListsModule,
    UserOrderModule,
    UserBasketModule,
    FavoriteListsModule,
    ReviewModule,
    BannerModule,
    DiscountModule,
    OrderModule,
    AnalyticsModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    MinioService,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogsMiddleware).forRoutes('*');
  }
}
