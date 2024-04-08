import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { CategoryEntity } from '../../category/entities/category.entity';
import { ProductEntity } from '../../product/entities/product.entity';
import { BaseEntity } from 'src/helpers/baseEntity.entity';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { MediaEntity } from 'src/media/entities/media.entity';
import { ApiProperty } from '@nestjs/swagger';

const minLengthErrorMessage =
  'Subcategory title  must be at least 1 characters';
const maxLengthErrorMessage = 'Subcategory title  can be maximum 50 characters';

@Entity({ name: 'subcategories' })
export class SubcategoryEntity extends BaseEntity {
  @ApiProperty({
    title: 'Title',
    name: 'enTitle',
    description: 'The title of the subcategory in English',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1, {
    message: minLengthErrorMessage,
  })
  @MaxLength(50, {
    message: maxLengthErrorMessage,
  })
  @Column({ type: 'varchar', nullable: false, unique: true })
  enTitle: string;

  @ApiProperty({
    title: 'Title',
    name: 'tkmTitle',
    description: 'The title of the subcategory in Turkmen',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1, {
    message: minLengthErrorMessage,
  })
  @MaxLength(50, {
    message: maxLengthErrorMessage,
  })
  @Column({ type: 'varchar', nullable: false, unique: true })
  tkmTitle: string;

  @ApiProperty({
    title: 'Title',
    name: 'ruTitle',
    description: 'The title of the subcategory in Russian',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1, {
    message: minLengthErrorMessage,
  })
  @MaxLength(50, {
    message: maxLengthErrorMessage,
  })
  @Column({ type: 'varchar', nullable: false, unique: true })
  ruTitle: string;

  @ApiProperty({
    title: 'Category ID',
    name: 'categoryId',
    description: 'The ID of the category to which the subcategory belongs',
    type: String,
  })
  @IsUUID(4)
  @Column({ type: 'uuid', nullable: false })
  categoryId: string;

  @ManyToOne(() => CategoryEntity, (category) => category.subcategories, {
    onDelete: 'CASCADE',
  })
  category: CategoryEntity;

  @OneToMany(() => ProductEntity, (product) => product.subcategory)
  products: ProductEntity[];

  @OneToMany(() => MediaEntity, (media) => media.subcategory)
  medias: MediaEntity[];
}
