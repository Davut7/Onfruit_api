import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';
import { ProductEntity } from 'src/admin/stock/product/entities/product.entity';
import { BaseEntity } from 'src/helpers/baseEntity.entity';
import { UserEntity } from 'src/client/user/users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'liked_products' })
export class LikedProductsEntity extends BaseEntity {
  @ApiProperty({
    example: 'd90ab7af-67d8-4b26-8d4b-dc84a2d9e3e1',
    description: 'The ID of the user who liked the product',
  })
  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @ApiProperty({
    example: 'fcd3a8cf-eeb0-4bfc-b1d3-176ce02d55d7',
    description: 'The ID of the product liked by the user',
  })
  @Column({ type: 'uuid', nullable: false })
  productId: string;

  @ApiProperty({ type: () => UserEntity })
  @ManyToOne(() => UserEntity, (user) => user.likedProducts)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @ApiProperty({ type: () => ProductEntity })
  @ManyToOne(() => ProductEntity, (product) => product.likedProducts)
  @JoinColumn({ name: 'productId' })
  product: ProductEntity;
}
