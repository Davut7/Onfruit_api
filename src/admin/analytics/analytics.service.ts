import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderEntity } from 'src/client/order/entities/order.entity';
import { UserEntity } from 'src/client/user/users/entities/user.entity';
import { LngEnum, OrderStatus } from 'src/helpers/constants';
import { Repository } from 'typeorm';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(OrderEntity)
    private orderRepository: Repository<OrderEntity>,

    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async getCompletedOrdersAndCount(): Promise<[OrderEntity[], number]> {
    this.logger.log(`Getting completed orders and count`);

    const orders = await this.orderRepository.find({
      where: { status: OrderStatus.DELIVERED },
    });
    const orderCount = await this.orderRepository.count({
      where: { status: OrderStatus.DELIVERED },
    });

    this.logger.log(`Completed orders and count retrieved successfully`);

    return [orders, orderCount];
  }

  async getMonthOrders() {
    this.logger.log(`Getting orders for the month`);

    const today = new Date();
    const month = today.getMonth();
    const monthAgo = +today - month;
    const [orders, count] = await this.orderRepository
      .createQueryBuilder('orders')
      .where('orders.createdAt <= :monthAgo', { monthAgo })
      .getManyAndCount();

    this.logger.log(`Month orders retrieved successfully`);

    return {
      orders: orders,
      ordersCount: count,
    };
  }

  async getRegisteredUsers() {
    this.logger.log(`Getting registered users`);

    const user = await this.userRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(user.id)', 'usersCount')
      .groupBy('user.role')
      .getRawMany();

    this.logger.log(`Registered users retrieved successfully`);

    return user;
  }

  async getRegisteredUsersToday() {
    this.logger.log(`Getting registered users today`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const usersCount = await this.userRepository
      .createQueryBuilder('user')
      .where('user.createdAt >= :today', { today })
      .select('COUNT(user.id)', 'usersCount')
      .getRawMany();

    this.logger.log(`Registered users today retrieved successfully`);

    return usersCount;
  }

  async getSoldProductsWeight() {
    this.logger.log(`Getting sold products weight`);

    const soldProductsWeight = await this.orderRepository
      .createQueryBuilder('orders')
      .innerJoin('orders.orderProducts', 'orderProducts')
      .select('SUM(orderProducts.productQuantity)', 'soldProductsWeight')
      .where('orders.status = :status', { status: OrderStatus.DELIVERED })
      .getRawMany();

    this.logger.log(`Sold products weight retrieved successfully`);

    return soldProductsWeight;
  }

  async getRecentOrders(): Promise<OrderEntity[]> {
    this.logger.log(`Getting recent orders`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const recentOrders = await this.orderRepository
      .createQueryBuilder('orders')
      .where('orders.createdAt >= :today', { today })
      .leftJoinAndSelect('orders.orderProducts', 'orderProducts')
      .leftJoinAndSelect('orderProducts.product', 'product')
      .leftJoinAndSelect('product.prices', 'prices')
      .leftJoinAndSelect('product.medias', 'medias')
      .getMany();

    this.logger.log(`Recent orders retrieved successfully`);

    return recentOrders;
  }

  async getTopSoldProducts() {
    this.logger.log(`Getting top sold products`);

    const topSoldProducts = await this.orderRepository
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

    this.logger.log(`Top sold products retrieved successfully`);

    return topSoldProducts;
  }

  async getTopNotSoldProducts() {
    this.logger.log(`Getting top not sold products`);

    const topNotSoldProducts = await this.orderRepository
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

    this.logger.log(`Top not sold products retrieved successfully`);

    return topNotSoldProducts;
  }
}
