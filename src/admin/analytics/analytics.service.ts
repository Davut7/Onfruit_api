import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderEntity } from 'src/client/order/entities/order.entity';
import { UserEntity } from 'src/client/user/users/entities/user.entity';
import { LngEnum, OrderStatus } from 'src/helpers/constants';
import { Repository } from 'typeorm';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(OrderEntity)
    private orderRepository: Repository<OrderEntity>,

    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async getCompletedOrdersAndCount(): Promise<[OrderEntity[], number]> {
    const orders = await this.orderRepository.find({
      where: { status: OrderStatus.DELIVERED },
    });
    const orderCount = await this.orderRepository.count({
      where: { status: OrderStatus.DELIVERED },
    });
    return [orders, orderCount];
  }

  async getMonthOrders() {
    const today = new Date();
    const month = today.getMonth();
    const monthAgo = +today - month;
    const [orders, count] = await this.orderRepository
      .createQueryBuilder('orders')
      .where('orders.createdAt <= :monthAgo', { monthAgo })
      .getManyAndCount();
    return {
      orders: orders,
      ordersCount: count,
    };
  }

  async getRegisteredUsers() {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(user.id)', 'usersCount')
      .groupBy('user.role')
      .getRawMany();
    return user;
  }

  async getRegisteredUsersToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.createdAt >= :today', { today })
      .select('COUNT(user.id)', 'usersCount')
      .getRawMany();
  }

  async getSoldProductsWeight() {
    return this.orderRepository
      .createQueryBuilder('orders')
      .innerJoin('orders.orderProducts', 'orderProducts')
      .select('SUM(orderProducts.productQuantity)', 'soldProductsWeight')
      .where('orders.status = :status', { status: OrderStatus.DELIVERED })
      .getRawMany();
  }

  async getRecentOrders(): Promise<OrderEntity[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.orderRepository
      .createQueryBuilder('orders')
      .where('orders.createdAt >= :today', { today })
      .leftJoinAndSelect('orders.orderProducts', 'orderProducts')
      .leftJoinAndSelect('orderProducts.product', 'product')
      .leftJoinAndSelect('product.prices', 'prices')
      .leftJoinAndSelect('product.medias', 'medias')
      .getMany();
  }

  async getTopSoldProducts() {
    return this.orderRepository
      .createQueryBuilder('orders')
      .innerJoin('orders.orderProducts', 'orderProducts')
      .innerJoin('orderProducts.product', 'product')
      .leftJoin('product.productAttributes', 'productAttributes')
      .groupBy('product.id, productAttributes.title')
      .orderBy('SUM(orderProducts.productQuantity)', 'DESC')
      .where('productAttributes.language = :language', { language: LngEnum.ru })
      .select([
        'product.id',
        'product.article',
        'productAttributes.title',
        'SUM(orderProducts.productQuantity) as totalQuantitySold',
      ])
      .limit(2)
      .getRawMany();
  }

  async getTopNotSoldProducts() {
    return this.orderRepository
      .createQueryBuilder('orders')
      .innerJoin('orders.orderProducts', 'orderProducts')
      .innerJoin('orderProducts.product', 'product')
      .leftJoin('product.productAttributes', 'productAttributes')
      .groupBy('product.id, productAttributes.title')
      .orderBy('SUM(orderProducts.productQuantity)', 'ASC')
      .where('productAttributes.language = :language', { language: LngEnum.ru })
      .select([
        'product.id',
        'product.article',
        'productAttributes.title',
        'SUM(orderProducts.productQuantity) as totalQuantitySold',
      ])
      .limit(2)
      .getRawMany();
  }
}
