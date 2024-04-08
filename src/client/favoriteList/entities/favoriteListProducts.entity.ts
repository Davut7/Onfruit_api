import { Min } from 'class-validator';
import { ProductEntity } from 'src/admin/stock/product/entities/product.entity';
import { BaseEntity } from 'src/helpers/baseEntity.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { FavoriteListEntity } from './favoriteLists.entity';
import { ColumnNumericTransformer } from 'src/helpers/transform/columnNumberTransfer';
import { ApiProperty } from '@nestjs/swagger';
import Api from 'twilio/lib/rest/Api';

@Entity({ name: 'favorite_list_products' })
export class FavoriteListProductsEntity extends BaseEntity {
  @ApiProperty({
    title: 'Product Quantity',
    name: 'productQuantity',
    description: 'The quantity of the product in the favorite list',
    type: Number,
  })
  @Min(1)
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 1,
    transformer: new ColumnNumericTransformer(),
    nullable: false,
  })
  productQuantity: number = 1;

  @ApiProperty({
    title: 'Product Sum',
    name: 'productSum',
    description: 'The total sum of the product in the favorite list',
    type: Number,
  })
  @Min(1)
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    nullable: false,
    transformer: new ColumnNumericTransformer(),
  })
  productSum: number = 0;

  @ApiProperty({
    title: 'Product Price',
    name: 'productPrice',
    description: 'The price of the product in the favorite list',
    type: Number,
  })
  @Min(1)
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    nullable: false,
    transformer: new ColumnNumericTransformer(),
  })
  productPrice: number;

  @ApiProperty({
    title: 'Product ID',
    name: 'productId',
    description: 'The ID of the product in the favorite list',
    type: String,
  })
  @Column({ type: 'uuid', unique: true })
  productId: string;

  @ApiProperty({
    title: 'Favorite List ID',
    name: 'favoriteListId',
    description: 'The ID of the favorite list',
    type: String,
  })
  @Column({ type: 'uuid', unique: true })
  favoriteListId: string;

  @ApiProperty({ type: () => ProductEntity })
  @ManyToOne(() => ProductEntity, (product) => product.favoriteListProduct, {
    cascade: true,
  })
  @JoinColumn({ name: 'productId' })
  product: ProductEntity;

  @ApiProperty({ type: () => FavoriteListEntity })
  @ManyToOne(
    () => FavoriteListEntity,
    (favoriteList) => favoriteList.favoriteProducts,
    {
      cascade: true,
    },
  )
  @JoinColumn({ name: 'favoriteListId' })
  favoriteList: FavoriteListEntity;
}
