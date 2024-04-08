import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { UserEntity } from 'src/client/user/users/entities/user.entity';
import { ClientAddressEntity } from 'src/client/user/address/entities/address.entity';
import { BaseEntity } from 'src/helpers/baseEntity.entity';
import { OrderProductsEntity } from './orderProducts.entity';
import { OrderStatus } from 'src/helpers/constants';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'orders' })
export class OrderEntity extends BaseEntity {
  @ApiProperty({
    name: 'orderAt',
    title: 'Order Date',
    example: '2024-04-01T10:30:00.000Z',
    description: 'The date and time when the order was placed',
  })
  @CreateDateColumn()
  orderAt: Date;

  @ApiProperty({
    name: 'status',
    title: 'Order Status',
    enum: OrderStatus,
    default: OrderStatus.PROCESSING,
    description: 'The status of the order',
  })
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PROCESSING })
  status: string;

  @ApiProperty({
    name: 'deliveredAt',
    title: 'Delivery Date',
    example: '2024-04-03T14:00:00.000Z',
    description: 'The date and time when the order was delivered',
  })
  @Column({ nullable: true })
  deliveredAt: Date;

  @ApiProperty({
    name: 'addressId',
    title: 'Delivery Address ID',
    example: '95dc0ed1-aa32-4d6a-90ae-b19e81dd9833',
    description: 'The ID of the address where the order will be delivered',
  })
  @Column({ type: 'uuid' })
  addressId: string;

  @ApiProperty({
    name: 'userId',
    title: 'User ID',
    example: 'fb9c882b-7b8d-45eb-b0d4-95ffba72be76',
    description: 'The ID of the user who placed the order',
  })
  @Column({ type: 'uuid' })
  userId: string;

  @ApiProperty({ type: () => ClientAddressEntity })
  @ManyToOne(() => ClientAddressEntity, (address) => address.order, {
    onDelete: 'NO ACTION',
  })
  deliveredAddress: ClientAddressEntity;

  @ApiProperty({ type: () => [OrderProductsEntity] })
  @OneToMany(() => OrderProductsEntity, (product) => product.order)
  orderProducts: OrderProductsEntity[];

  @ApiProperty({ type: () => UserEntity })
  @ManyToOne(() => UserEntity, (user) => user.orders, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;
}
