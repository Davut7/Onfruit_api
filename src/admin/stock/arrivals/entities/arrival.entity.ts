import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ProductEntity } from '../../product/entities/product.entity';
import { BaseEntity } from 'src/helpers/baseEntity.entity';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ColumnNumericTransformer } from 'src/helpers/transform/columnNumberTransfer';

@Entity({ name: 'arrivals' })
export class ArrivalEntity extends BaseEntity {
  @ApiProperty({
    title: 'Quantity',
    name: 'quantity',
    description: 'The quantity of the arrival',
    type: Number,
    example: 10,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Column({
    type: 'decimal',
    precision: 20,
    default: 0,
    scale: 3,
    transformer: new ColumnNumericTransformer(),
  })
  quantity: number;

  @ApiProperty({
    title: 'Arrive Price',
    name: 'arrivePrice',
    description: 'The price of the arrival',
    type: Number,
    example: 50.99,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Column({
    type: 'decimal',
    precision: 20,
    default: 0,
    scale: 3,
    transformer: new ColumnNumericTransformer(),
  })
  arrivePrice: number;

  @ApiProperty({
    title: 'Sum',
    name: 'sum',
    description: 'The sum of the arrival',
    type: Number,
    example: 509.9,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Column({
    type: 'decimal',
    precision: 20,
    default: 0,
    scale: 3,
    transformer: new ColumnNumericTransformer(),
  })
  sum: number;

  @ApiProperty({
    title: 'Product Article',
    name: 'productArticle',
    description: 'The article of the product',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @Column({ type: 'varchar', nullable: false })
  productArticle: string;

  @ApiProperty({
    title: 'Spoiled Quantity',
    name: 'spoiledQuantity',
    description: 'The spoiled quantity of the arrival',
    type: Number,
    example: 2,
    required: false,
  })
  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  @Min(0)
  @Column({
    type: 'decimal',
    precision: 20,
    default: 0,
    scale: 3,
    transformer: new ColumnNumericTransformer(),
  })
  spoiledQuantity: number;

  @ApiProperty({
    title: 'Product ID',
    name: 'productId',
    description: 'The ID of the associated product',
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', nullable: false })
  productId: string;

  @ManyToOne(() => ProductEntity, (product) => product.arrivals, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn()
  product: ProductEntity;
}
