import {
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { OrderEntity } from 'src/client/order/entities/order.entity';
import { UserEntity } from 'src/client/user/users/entities/user.entity';
import { BaseEntity } from 'src/helpers/baseEntity.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'user_addresses' })
export class ClientAddressEntity extends BaseEntity {
  @ApiProperty({
    example: 'Home',
    description: 'The title of the address',
    name: 'title',
    title: 'Title',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(1, { message: 'Title must be at least 1 character!' })
  @MaxLength(30, { message: 'Title can be maximum 30 characters!' })
  @Column({ type: 'varchar', nullable: false, unique: true })
  title: string;

  @ApiProperty({
    example: '123 Street, City',
    description: 'The main address',
    name: 'address',
    title: 'Address',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(1, { message: 'Address must be at least 1 character!' })
  @MaxLength(300, { message: 'Address can be maximum 300 characters!' })
  @Column({ type: 'varchar', nullable: false })
  address: string;

  @ApiProperty({
    example: 'Apartment 1',
    description: 'Additional details about the address',
    name: 'details',
    title: 'Details',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(1, { message: 'Details must be at least 1 character!' })
  @MaxLength(300, { message: 'Details can be maximum 300 characters!' })
  @Column({ type: 'varchar', nullable: false })
  details: string;

  @ApiProperty({
    example: '+99365123456',
    description: 'The phone number associated with the address (TM format)',
    name: 'phoneNumber',
    title: 'Phone Number',
  })
  @IsPhoneNumber('TM')
  @Column({ type: 'varchar', nullable: false })
  phoneNumber: string;

  @ApiProperty({
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    description: 'The ID of the user associated with the address',
    name: 'userId',
    title: 'User ID',
  })
  @IsUUID(4)
  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @ManyToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @OneToMany(() => OrderEntity, (order) => order.deliveredAddress)
  order: OrderEntity;
}
