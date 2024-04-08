import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsString, IsUUID, Min } from 'class-validator';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from 'src/helpers/baseEntity.entity';
import { ProductEntity } from 'src/admin/stock/product/entities/product.entity';
import { ColumnNumericTransformer } from 'src/helpers/transform/columnNumberTransfer';

@Entity({ name: 'product_realizations' })
export class RealizationEntity extends BaseEntity {
  @ApiProperty({
    title: 'Product Article',
    name: 'productArticle',
    description: 'The article of the product realization',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @Column({ type: 'varchar', nullable: false })
  productArticle: string;

  @ApiProperty({
    title: 'Quantity',
    name: 'quantity',
    description: 'The quantity of the product realization',
    type: Number,
    example: 10,
  })
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  @Min(1)
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  quantity: number;

  @ApiProperty({
    title: 'Middle Price',
    name: 'middlePrice',
    description: 'The middle price of the product realization',
    type: Number,
    example: 50.99,
  })
  @IsNumber()
  @IsPositive()
  @Min(0)
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  middlePrice: number;

  @ApiProperty({
    title: 'Sum',
    name: 'sum',
    description: 'The sum of the product realization',
    type: Number,
    example: 509.9,
  })
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  @Min(1)
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  sum: number;

  @ApiProperty({
    title: 'Product ID',
    name: 'productId',
    description: 'The ID of the associated product',
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID(4)
  @Column({ type: 'uuid', nullable: false })
  productId: string;

  @ApiProperty({
    title: 'Is Active',
    name: 'isActive',
    description: 'The status of the product realization',
    type: Boolean,
  })
  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @ManyToOne(() => ProductEntity, (product) => product.realizations)
  @JoinColumn()
  product: ProductEntity;
}
