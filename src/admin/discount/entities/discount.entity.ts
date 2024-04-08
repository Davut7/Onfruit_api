import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from 'src/helpers/baseEntity.entity';
import { UserRolesEnum } from 'src/helpers/constants';
import { Entity, Column, OneToMany } from 'typeorm';
import { ProductEntity } from 'src/admin/stock/product/entities/product.entity';

@Entity({ name: 'discounts' })
export class DiscountEntity extends BaseEntity {
  @ApiProperty({
    title: 'Discount Percent',
    name: 'discountPercent',
    description: 'The discount percentage',
    type: Number,
    example: 10,
  })
  @Column()
  discountPercent: number;

  @ApiProperty({
    title: 'User Type',
    name: 'userType',
    description: 'The user type for which the discount is applicable',
    enum: UserRolesEnum,
    enumName: 'UserRolesEnum',
  })
  @Column({ type: 'enum', enum: UserRolesEnum })
  userType: UserRolesEnum;

  @ApiProperty({
    title: 'Product ID',
    name: 'productId',
    description: 'The ID of the product to which the discount applies',
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid' })
  productId: string;

  @ApiProperty({
    title: 'Product',
    name: 'product',
    description: 'The product to which the discount applies',
    type: () => ProductEntity,
  })
  @OneToMany(() => ProductEntity, (product) => product.discount)
  product: ProductEntity;
}
