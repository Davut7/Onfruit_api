import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GetOrders } from 'src/client/order/dto/getOrders.dto';
import { OrderEntity } from 'src/client/order/entities/order.entity';
import { GetOrdersEnum, OrderStatus, OrderType } from 'src/helpers/constants';
import { DataSource, Repository } from 'typeorm';
import { UpdateOrderDto } from './dto/updateOrder.dto';
import { ProductEntity } from '../stock/product/entities/product.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private orderRepository: Repository<OrderEntity>,
    private dataSource: DataSource,
  ) {}
  async getOrders(query?: GetOrders) {
    const {
      order = OrderType.ASC,
      orderBy = GetOrdersEnum.createdAt,
      page = 1,
      take = 10,
    } = query;

    const orderQuery = this.orderRepository
      .createQueryBuilder('orders')
      .leftJoinAndSelect('orders.orderProducts', 'orderProducts')
      .leftJoinAndSelect('orders.deliveredAddress', 'deliveredAddress')
      .loadRelationCountAndMap(
        'orders.orderProductsCount',
        'orders.orderProducts',
      );
    if (query.status) {
      orderQuery.andWhere('orders.status = :status', { status: query.status });
    }
    const [orders, count] = await orderQuery
      .take(take)
      .skip((page - 1) * take)
      .orderBy('orders.' + orderBy, order)
      .getManyAndCount();

    return {
      message: 'Orders retrieved successfully',
      orders: orders,
      orderCount: count,
    };
  }

  async getOneOrder(orderId: string) {
    const order = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.orderProducts', 'orderProducts')
      .leftJoinAndSelect('order.deliveredAddress', 'deliveredAddress')
      .loadRelationCountAndMap(
        'order.orderProductsCount',
        'order.orderProducts',
      )
      .leftJoinAndSelect('orderProducts.product', 'products')
      .where('order.id = :orderId', {
        orderId: orderId,
      })
      .getOne();
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);
    return order;
  }

  async getOrderById(orderId: string) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });
    if (!order)
      throw new NotFoundException(`Order with id ${orderId} not found`);
    return order;
  }

  async updateOrder(orderId: string, dto: UpdateOrderDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const order = await this.getOneOrder(orderId);
    try {
      order.status = dto.status;
      if (order.status === OrderStatus.DELIVERED) {
        for (const orderProduct of order.orderProducts) {
          const product = await queryRunner.manager.findOne(ProductEntity, {
            where: { id: orderProduct.productId },
          });
          product.currentSaleQuantity -= orderProduct.productQuantity;
          product.currentSum -= orderProduct.productSum;
          await queryRunner.manager.save(product);
        }
        await queryRunner.manager.save(order);
        return {
          message: 'Order updated successfully',
          order: order,
        };
      }

      if (order.status === OrderStatus.CANCELLED) {
        for (const orderProduct of order.orderProducts) {
          const product = await queryRunner.manager.findOne(ProductEntity, {
            where: { id: orderProduct.productId },
          });
          product.currentSaleQuantity += orderProduct.productQuantity;
          product.currentSum += orderProduct.productSum;
          await queryRunner.manager.save(product);
        }
        await queryRunner.manager.save(order);
        return {
          message: 'Order updated successfully',
          order: order,
        };
      }

      await queryRunner.manager.save(order);
      return {
        message: 'Order updated successfully',
        order: order,
      };
    } catch (err) {
      console.log(err);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        'Something went wrong when updating order',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async deleteOrder(orderId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const order = await this.getOneOrder(orderId);
      if (order.status === OrderStatus.DELIVERING)
        throw new BadRequestException(
          'Order already on road. We can delete it now.',
        );
      for (const orderProduct of order.orderProducts) {
        const product = await queryRunner.manager.findOne(ProductEntity, {
          where: { id: orderProduct.productId },
        });
        product.currentSaleQuantity += orderProduct.productQuantity;
        product.currentSum += orderProduct.productSum;
        await queryRunner.manager.save(product);
      }
      await this.orderRepository.delete(order.id);
      return {
        message: 'Order deleted successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Error while deleting order');
    } finally {
      await queryRunner.release();
    }
  }
}
