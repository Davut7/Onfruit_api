import { BaseEntity } from 'src/helpers/baseEntity.entity';
import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { ClientAddressEntity } from '../../address/entities/address.entity';
import {
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { UserRolesEnum } from 'src/helpers/constants';
import { UserTokenEntity } from '../../token/entities/userToken.entity';
import { MediaEntity } from 'src/media/entities/media.entity';
import { ApiProperty } from '@nestjs/swagger';
import { OrderEntity } from 'src/client/order/entities/order.entity';
import { LikedProductsEntity } from 'src/client/likedProducts/entities/likedProducts.entity';
import { FavoriteListEntity } from 'src/client/favoriteList/entities/favoriteLists.entity';
import { BasketEntity } from 'src/client/basket/entities/basket.entity';

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {
  @ApiProperty({
    example: 'John',
    description: 'The first name of the user',
    title: 'First Name',
    name: 'firstName',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(1, { message: 'First name must be at least one character!' })
  @MaxLength(30, { message: 'First name can be maximum 30 characters!' })
  @Column({ type: 'varchar', nullable: false })
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'The last name of the user',
    title: 'Last Name',
    name: 'lastName',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(1, { message: 'Last name must be at least one character!' })
  @MaxLength(30, { message: 'Last name can be maximum 30 characters!' })
  @Column({ type: 'varchar', nullable: false })
  lastName: string;

  @ApiProperty({
    example: '1234567',
    description: 'The phone number of the user in Turkmenistan',
    title: 'Phone Number',
    name: 'phoneNumber',
  })
  @IsNotEmpty()
  @IsPhoneNumber('TM')
  @Column({ type: 'varchar', unique: true, nullable: false })
  phoneNumber: string;

  @ApiProperty({
    enum: UserRolesEnum,
    description: 'The role of the user',
    title: 'Role',
    name: 'role',
  })
  @IsNotEmpty()
  @IsEnum(UserRolesEnum)
  @Column({ type: 'varchar', nullable: false })
  role: string;

  @ApiProperty({
    example: '2022-01-01T12:00:00Z',
    description: 'The timestamp for code time',
    title: 'Code Time',
    name: 'codeTime',
  })
  @Column({ type: 'timestamp', nullable: true })
  codeTime: Date;

  @ApiProperty({
    example: 'ACME Inc.',
    description: 'The name of the company the user belongs to',
    title: 'Company Name',
    name: 'companyName',
  })
  @IsString()
  @MinLength(1, { message: 'Company name must be at least one character!' })
  @MaxLength(30, { message: 'Company name can be maximum 30 characters!' })
  @Column({ type: 'varchar', nullable: true })
  companyName: string;

  @ApiProperty({
    example: 'Technology',
    description: 'The type of company the user belongs to',
    title: 'Company Type',
    name: 'companyType',
  })
  @IsString()
  @MinLength(1, { message: 'Company type must be at least one character!' })
  @MaxLength(30, { message: 'Company type can be maximum 30 characters!' })
  @Column({ type: 'varchar', nullable: true })
  companyType: string;

  @ApiProperty({
    example: '12345678',
    description: 'The phone number of the company in Turkmenistan',
    title: 'Company Phone Number',
    name: 'companyPhoneNumber',
  })
  @IsPhoneNumber('TM')
  @Column({ type: 'varchar', nullable: true })
  companyPhoneNumber: string;

  @ApiProperty({
    example: '192.168.1.1',
    description: 'The IP address of the company',
    title: 'Company IP',
    name: 'companyIp',
  })
  @Column({ type: 'varchar', unique: true, nullable: true })
  companyIp: string;

  @ApiProperty({
    example: 'abc123',
    description: 'The activation code for the user',
    title: 'Activation Code',
    name: 'activationCode',
  })
  @Column({ type: 'varchar', nullable: true })
  activationCode: string;

  @ApiProperty({
    example: true,
    description: 'Whether the user is activated or not',
    title: 'Activation Status',
    name: 'isActivated',
  })
  @IsBoolean()
  @Column({ type: 'boolean', default: false })
  isActivated: boolean;

  @ApiProperty({
    description: 'The token associated with the user',
    title: 'User Token',
    name: 'token',
  })
  @OneToOne(() => UserTokenEntity, (token) => token.user)
  token: UserTokenEntity;

  @ApiProperty({
    description: 'The addresses associated with the user',
    title: 'User Addresses',
    name: 'addresses',
  })
  @OneToMany(() => ClientAddressEntity, (addresses) => addresses.userId)
  addresses: ClientAddressEntity[];

  @ApiProperty({
    description: 'The orders placed by the user',
    title: 'User Orders',
    name: 'orders',
  })
  @OneToMany(() => OrderEntity, (orders) => orders.user)
  orders: OrderEntity[];

  @ApiProperty({
    description: 'The products liked by the user',
    title: 'Liked Products',
    name: 'likedProducts',
  })
  @OneToMany(() => LikedProductsEntity, (likedProducts) => likedProducts.user)
  likedProducts: LikedProductsEntity[];

  @ApiProperty({
    description: 'The favorite lists created by the user',
    title: 'Favorite Lists',
    name: 'favoriteList',
  })
  @OneToMany(() => FavoriteListEntity, (favoriteList) => favoriteList.user)
  favoriteList: FavoriteListEntity[];

  @ApiProperty({
    description: 'The basket associated with the user',
    title: 'User Basket',
    name: 'basket',
  })
  @OneToMany(() => BasketEntity, (basket) => basket.user)
  basket: BasketEntity[];

  @ApiProperty({
    description: 'The media associated with the user',
    title: 'User Media',
    name: 'media',
  })
  @OneToOne(() => MediaEntity, (media) => media.user)
  media: MediaEntity;
}
