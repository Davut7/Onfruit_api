import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/helpers/baseEntity.entity';
import { ArrivalEntity } from '../../arrivals/entities/arrival.entity';
import { RealizationEntity } from 'src/admin/production/realizations/entities/realizations.entity';
import { ProductAttributesEntity } from '../../productAttributes/entities/productAttributes.entity';
import { RealizationPriceEntity } from 'src/admin/production/realizationPrices/entities/realizationPrices.entity';
import { CommodityEnum } from 'src/helpers/constants/stock/products/commodity.enum';
import { LikedProductsEntity } from 'src/client/likedProducts/entities/likedProducts.entity';
import { FavoriteListProductsEntity } from 'src/client/favoriteList/entities/favoriteListProducts.entity';
import { OrderProductsEntity } from 'src/client/order/entities/orderProducts.entity';
import { BasketEntity } from 'src/client/basket/entities/basket.entity';
import { MediaEntity } from 'src/media/entities/media.entity';
import { DiscountEntity } from 'src/admin/discount/entities/discount.entity';
import { ColumnNumericTransformer } from 'src/helpers/transform/columnNumberTransfer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';
import { SubcategoryEntity } from '../../subcategory/entities/subcategory.entity';

@Entity({ name: 'products' })
export class ProductEntity extends BaseEntity {
  @ApiProperty({
    title: 'Article',
    name: 'article',
    description: 'The unique article of the product',
    type: String,
  })
  @IsNotEmpty()
  @Matches(/^\d{1,6}$/, { message: 'Article must be a 6-digit number.' })
  @Index({ unique: true })
  @Column({ type: 'varchar', unique: true, nullable: false })
  article: string;

  @ApiProperty({
    title: 'Commodity',
    name: 'commodity',
    description: 'The type of commodity the product belongs to',
    enum: CommodityEnum,
  })
  @IsNotEmpty()
  @IsEnum(CommodityEnum)
  @Column({
    type: 'varchar',
    nullable: false,
    default: 'kilogram',
  })
  commodity: CommodityEnum;

  @ApiProperty({
    title: 'Barcode',
    name: 'barcode',
    description: 'The unique barcode of the product',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  @Index({ unique: true })
  @Column({ type: 'varchar', nullable: false, unique: true })
  barcode: string;

  @ApiProperty({
    title: 'Subcategory ID',
    name: 'subcategoryId',
    description: 'The ID of the subcategory that the product belongs to',
    type: String,
  })
  @IsUUID(4)
  @Column({ type: 'uuid', nullable: false })
  subcategoryId: string;

  @ApiProperty({
    title: 'Current Sum',
    name: 'currentSum',
    description: 'The current sum of the product',
    type: Number,
  })
  @IsNumber()
  @IsPositive()
  @Column({
    type: 'decimal',
    precision: 20,
    default: 0.0,
    scale: 3,
    transformer: new ColumnNumericTransformer(),
  })
  currentSum: number;

  @ApiProperty({
    title: 'Current Quantity',
    name: 'currentQuantity',
    description: 'The current quantity of the product',
    type: Number,
  })
  @IsNumber()
  @IsPositive()
  @Column({
    type: 'decimal',
    precision: 20,
    default: 0.0,
    scale: 3,
    transformer: new ColumnNumericTransformer(),
  })
  currentQuantity: number;

  @ApiProperty({
    title: 'Current Spoiled Quantity',
    name: 'currentSpoiledQuantity',
    description: 'The current spoiled quantity of the product',
    type: Number,
  })
  @IsNumber()
  @IsPositive()
  @Column({
    type: 'decimal',
    precision: 20,
    default: 0.0,
    scale: 3,
    transformer: new ColumnNumericTransformer(),
  })
  currentSpoiledQuantity: number;

  @ApiProperty({
    title: 'Current Sale Quantity',
    name: 'currentSaleQuantity',
    description: 'The current sale quantity of the product',
    type: Number,
  })
  @IsNumber()
  @IsPositive()
  @Column({
    type: 'decimal',
    precision: 20,
    default: 0.0,
    scale: 3,
    transformer: new ColumnNumericTransformer(),
  })
  currentSaleQuantity: number;

  @ApiProperty({ type: () => SubcategoryEntity })
  @ManyToOne(() => SubcategoryEntity, (subcategory) => subcategory.products)
  subcategory: SubcategoryEntity;

  @ApiProperty({ type: () => MediaEntity })
  @OneToMany(() => MediaEntity, (media) => media.product)
  medias: MediaEntity[];

  @ApiProperty({ type: () => ProductAttributesEntity })
  @OneToMany(
    () => ProductAttributesEntity,
    (productAttributes) => productAttributes.product,
  )
  productAttributes: ProductAttributesEntity[];

  @ApiProperty({ type: () => ArrivalEntity })
  @OneToMany(() => ArrivalEntity, (arrivals) => arrivals.product)
  arrivals: ArrivalEntity[];

  @ApiProperty({ type: () => RealizationEntity })
  @OneToMany(() => RealizationEntity, (realizations) => realizations.product)
  realizations: RealizationEntity[];

  @ApiProperty({ type: () => RealizationPriceEntity })
  @OneToMany(() => RealizationPriceEntity, (prices) => prices.product)
  prices: RealizationPriceEntity[];

  @ApiProperty({ type: () => BasketEntity })
  @OneToMany(() => BasketEntity, (op) => op.basketProduct)
  basketProduct: BasketEntity;

  @ApiProperty({ type: () => LikedProductsEntity })
  @OneToMany(() => LikedProductsEntity, (likedProduct) => likedProduct.product)
  likedProducts: LikedProductsEntity[];

  @ApiProperty({ type: () => FavoriteListProductsEntity })
  @OneToMany(
    () => FavoriteListProductsEntity,
    (favoriteProduct) => favoriteProduct.product,
  )
  favoriteListProduct: FavoriteListProductsEntity[];

  @ApiProperty({ type: () => OrderProductsEntity })
  @OneToMany(() => OrderProductsEntity, (orderProduct) => orderProduct.product)
  orderProduct: OrderProductsEntity[];

  @ApiProperty({ type: () => DiscountEntity })
  @OneToMany(() => DiscountEntity, (discount) => discount.product)
  discount: DiscountEntity;
}
