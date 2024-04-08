import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../../helpers/baseEntity.entity';
import { ProductEntity } from '../../product/entities/product.entity';
import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { LngEnum } from 'src/helpers/constants';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'products_attributes' })
export class ProductAttributesEntity extends BaseEntity {
  @ApiProperty({
    title: 'Title',
    name: 'title',
    description: 'The title of the product attribute',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @Index()
  @Column({ type: 'varchar', nullable: false })
  title: string;

  @ApiProperty({
    title: 'Language',
    name: 'language',
    description: 'The language of the product attribute',
    enum: LngEnum,
  })
  @IsEnum(LngEnum)
  @Column({
    type: 'varchar',
    nullable: false,
  })
  language: LngEnum;

  @ApiProperty({
    title: 'Description',
    name: 'description',
    description: 'The description of the product attribute',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @Column({ type: 'text', nullable: false })
  description: string;

  @ApiProperty({
    title: 'Manufacturer Country',
    name: 'manufacturerCountry',
    description: 'The manufacturer country of the product attribute',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @Column({ type: 'varchar', nullable: false })
  manufacturerCountry: string;

  @ApiProperty({
    title: 'Product ID',
    name: 'productId',
    description: 'The ID of the product to which the attribute belongs',
    type: String,
  })
  @IsUUID(4)
  @Column({
    type: 'uuid',
    nullable: false,
  })
  productId: string;

  @ApiProperty({ type: () => ProductEntity })
  @ManyToOne(() => ProductEntity, (product) => product.productAttributes, {
    onDelete: 'CASCADE',
  })
  product: ProductEntity;
}
