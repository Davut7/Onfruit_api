import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, Min } from 'class-validator';
import { BaseEntity } from 'src/helpers/baseEntity.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ProductEntity } from 'src/admin/stock/product/entities/product.entity';
import { UserRolesEnum } from 'src/helpers/constants';
import { ColumnNumericTransformer } from 'src/helpers/transform/columnNumberTransfer';

@Entity({ name: 'realization_prices' })
export class RealizationPriceEntity extends BaseEntity {
  @ApiProperty({
    title: 'Price',
    name: 'price',
    description: 'The price of the realization',
    type: Number,
    example: 50.99,
  })
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  price: number;

  @ApiProperty({
    title: 'Quantity',
    name: 'quantity',
    description: 'The quantity of the realization',
    type: Number,
    example: 10,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Column({
    type: 'int',
    nullable: false,
  })
  quantity: number;

  @ApiProperty({
    title: 'User Type',
    name: 'userType',
    description: 'The user type associated with the realization',
    enum: UserRolesEnum,
  })
  @Column({ type: 'enum', enum: UserRolesEnum, nullable: false })
  userType: UserRolesEnum;

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


  @ManyToOne(() => ProductEntity, (product) => product.prices, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  product: ProductEntity;
}
