import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { BaseEntity } from 'src/helpers/baseEntity.entity';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ProductEntity } from 'src/admin/stock/product/entities/product.entity';
import { CategoryEntity } from 'src/admin/stock/category/entities/category.entity';
import { SubcategoryEntity } from 'src/admin/stock/subcategory/entities/subcategory.entity';
import { EmployeeEntity } from 'src/admin/employee/entities/employee.entity';
import { UserEntity } from 'src/client/user/users/entities/user.entity';
import { BannerEntity } from 'src/admin/banner/entities/banner.entity';

@Entity({ name: 'medias' })
export class MediaEntity extends BaseEntity {
  @ApiProperty({ description: 'Image name', type: 'string' })
  @IsString()
  @IsNotEmpty()
  @Column({ type: 'text', nullable: false })
  imageName: string;

  @ApiProperty({ description: 'Image path', type: 'string' })
  @IsString()
  @IsNotEmpty()
  @Column({ type: 'text', nullable: false })
  imagePath: string;

  @ApiProperty({ description: 'MIME type', type: 'string' })
  @IsString()
  @IsNotEmpty()
  @Column({ type: 'text', nullable: false })
  mimeType: string;

  @ApiProperty({ description: 'Original name', type: 'string' })
  @IsString()
  @IsNotEmpty()
  @Column({ type: 'text', nullable: false })
  originalName: string;

  @ApiProperty({ description: 'Product ID', type: 'string', format: 'uuid' })
  @IsUUID(4)
  @Column({ type: 'uuid', nullable: true })
  productId: string;

  @ApiProperty({ description: 'Category ID', type: 'string', format: 'uuid' })
  @IsUUID(4)
  @Column({ type: 'uuid', nullable: true })
  categoryId: string;

  @ApiProperty({
    description: 'Subcategory ID',
    type: 'string',
    format: 'uuid',
  })
  @IsUUID(4)
  @Column({ type: 'uuid', nullable: true })
  subcategoryId: string;

  @ApiProperty({ description: 'Employee ID', type: 'string', format: 'uuid' })
  @IsUUID(4)
  @Column({ type: 'uuid', nullable: true })
  employeeId: string;

  @ApiProperty({ description: 'User ID', type: 'string', format: 'uuid' })
  @IsUUID(4)
  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @ApiProperty({ description: 'Banner ID', type: 'string', format: 'uuid' })
  @IsUUID(4)
  @Column({ type: 'uuid', nullable: true })
  bannerId: string;

  @ManyToOne(() => ProductEntity, (product) => product.medias)
  product: ProductEntity;

  @ManyToOne(() => CategoryEntity, (category) => category.medias)
  category: CategoryEntity;

  @ManyToOne(() => SubcategoryEntity, (subcategory) => subcategory.medias)
  subcategory: SubcategoryEntity;

  @ManyToOne(() => EmployeeEntity, (employee) => employee.medias)
  employee: EmployeeEntity;

  @OneToOne(() => UserEntity, (user) => user.media)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @OneToOne(() => BannerEntity, (banner) => banner.media)
  @JoinColumn({ name: 'bannerId' })
  banner: BannerEntity;
}
