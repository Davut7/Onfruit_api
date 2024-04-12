import { BaseEntity } from 'src/helpers/baseEntity.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { UserEntity } from 'src/client/user/users/entities/user.entity';
import { FavoriteListProductsEntity } from './favoriteListProducts.entity';
import { ApiProperty } from '@nestjs/swagger';
import { ClientAddressEntity } from 'src/client/user/address/entities/address.entity';

@Entity({ name: 'favorite_list' })
export class FavoriteListEntity extends BaseEntity {
  @ApiProperty({
    title: 'Title',
    description: 'The title of the favorite list',
    maxLength: 255,
    minLength: 1,
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(1, { message: 'Title length must be greater than 1' })
  @MaxLength(255, { message: 'Title length can be not greater than 255' })
  @Column({ type: 'varchar', nullable: false })
  title: string;

  @ApiProperty({ type: 'string', description: 'User id' })
  @Column({ type: 'uuid', unique: true })
  userId: string;

  @ManyToOne(() => UserEntity, (user) => user.favoriteList)
  user: UserEntity;

  @OneToMany(
    () => FavoriteListProductsEntity,
    (favoriteProducts) => favoriteProducts.favoriteList,
  )
  favoriteProducts: FavoriteListProductsEntity[];
}
