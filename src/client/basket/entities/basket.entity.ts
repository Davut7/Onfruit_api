import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ProductEntity } from 'src/admin/stock/product/entities/product.entity';
import { BaseEntity } from 'src/helpers/baseEntity.entity';
import { UserEntity } from 'src/client/user/users/entities/user.entity';
import { Min } from 'class-validator';
import { ColumnNumericTransformer } from 'src/helpers/transform/columnNumberTransfer';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'user_basket' })
export class BasketEntity extends BaseEntity {
  @ApiProperty({
    title: 'Product Quantity',
    name: 'productQuantity',
    description: 'The quantity of the product in the basket',
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
  productQuantity: number;

  @ApiProperty({
    title: 'Product Sum',
    name: 'productSum',
    description: 'The total sum of the product in the basket',
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
  productSum: number;

  @ApiProperty({
    title: 'Product Price',
    name: 'productPrice',
    description: 'The price of the product in the basket',
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
    description: 'The ID of the product in the basket',
    type: String,
  })
  @Column({ type: 'uuid', unique: true })
  productId: string;

  @ApiProperty({
    title: 'User ID',
    name: 'userId',
    description: 'The ID of the user who owns the basket',
    type: String,
  })
  @Column({ type: 'uuid', unique: true })
  userId: string;


  @ManyToOne(() => UserEntity, (user) => user.basket)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;


  @ManyToOne(() => ProductEntity, (prod) => prod.basketProduct, {
    cascade: true,
  })
  @JoinColumn({ name: 'productId' })
  basketProduct: ProductEntity;
}
