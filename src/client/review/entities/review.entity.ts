import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../helpers/baseEntity.entity';
import { ProductEntity } from 'src/admin/stock/product/entities/product.entity';
import { UserEntity } from 'src/client/user/users/entities/user.entity';
import { IsIn, IsNotEmpty, IsNumber, IsString } from 'class-validator';

@Entity({ name: 'product_reviews' })
export class ReviewEntity extends BaseEntity {
  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @Column({ type: 'uuid', nullable: false })
  productId: string;

  @IsNotEmpty()
  @IsString()
  @Column({ type: 'varchar', nullable: false })
  review: string;

  @IsNotEmpty()
  @IsNumber()
  @IsIn([1, 5])
  @Column({ type: 'float', nullable: false })
  star: number;

  @ManyToOne(() => ProductEntity, (product) => product.reviews)
  product: ProductEntity;

  @ManyToOne(() => UserEntity, (user) => user.reviews)
  user: UserEntity;
}
