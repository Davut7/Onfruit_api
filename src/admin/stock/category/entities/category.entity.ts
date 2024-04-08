import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from 'src/helpers/baseEntity.entity';
import { Column, Entity, Index, OneToMany } from 'typeorm';
import { SubcategoryEntity } from '../../subcategory/entities/subcategory.entity';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { MediaEntity } from 'src/media/entities/media.entity';

@Entity({
  name: 'categories',
})
export class CategoryEntity extends BaseEntity {
  @ApiProperty({
    title: 'English Title',
    name: 'enTitle',
    description: 'The English title of the category',
    type: String,
  })
  @IsString()
  @IsNotEmpty({ message: 'English title cannot be empty' })
  @MinLength(1, { message: 'English title must be at least 1 character long' })
  @Column({ type: 'varchar', nullable: false, unique: true })
  @Index({ unique: true })
  enTitle: string;

  @ApiProperty({
    title: 'Russian Title',
    name: 'ruTitle',
    description: 'The Russian title of the category',
    type: String,
  })
  @IsString()
  @IsNotEmpty({ message: 'Russian title cannot be empty' })
  @MinLength(1, { message: 'Russian title must be at least 1 character long' })
  @Column({ type: 'varchar', nullable: false, unique: true })
  @Index({ unique: true })
  ruTitle: string;

  @ApiProperty({
    title: 'Turkmen Title',
    name: 'tkmTitle',
    description: 'The Turkmen title of the category',
    type: String,
  })
  @IsString()
  @IsNotEmpty({ message: 'Turkmen title cannot be empty' })
  @MinLength(1, { message: 'Turkmen title must be at least 1 character long' })
  @Column({ type: 'varchar', nullable: false, unique: true })
  @Index({ unique: true })
  tkmTitle: string;

  @OneToMany(
    () => SubcategoryEntity,
    (subcategories) => subcategories.category,
    { cascade: true },
  )
  subcategories: SubcategoryEntity[];

  @OneToMany(() => MediaEntity, (media) => media.category)
  medias: MediaEntity[];
}
