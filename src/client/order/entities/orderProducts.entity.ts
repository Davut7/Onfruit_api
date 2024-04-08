import { Min } from 'class-validator';
import { ProductEntity } from 'src/admin/stock/product/entities/product.entity';
import { BaseEntity } from 'src/helpers/baseEntity.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { OrderEntity } from './order.entity';
import { ColumnNumericTransformer } from 'src/helpers/transform/columnNumberTransfer';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'order_products' })
export class OrderProductsEntity extends BaseEntity {
  @ApiProperty({
    example: 1,
    description: 'The quantity of the product ordered',
    name: 'productQuantity',
    title: 'Product Quantity',
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
    example: 0,
    description: 'The total sum of the product ordered',
    name: 'productSum',
    title: 'Product Sum',
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
    type: 'string',
    required: true,
    description: 'Product id',
    name: 'productId',
  })
  @Column({ type: 'uuid' })
  productId: string;

  @ApiProperty({
    type: 'string',
    required: true,
    description: 'Order id',
    name: 'orderId',
  })
  @Column({ type: 'uuid' })
  orderId: string;


  @ManyToOne(() => OrderEntity, (order) => order.orderProducts, {
    onDelete: 'CASCADE',
  })
  order: OrderEntity;


  @ManyToOne(() => ProductEntity, (product) => product.orderProduct, {
    onDelete: 'CASCADE',
  })
  product: ProductEntity;
}
