import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { OrderEntity } from './entities/order.entity';
import { OrderProductsEntity } from './entities/orderProducts.entity';
import { UserEntity } from '../user/users/entities/user.entity';
import { UserBasketService } from '../basket/basket.service';
import { UserTokenDto } from '../user/token/dto/userToken.dto';
import { GetOrders } from './dto/getOrders.dto';
import { GetOrdersEnum, OrderStatus, OrderType } from 'src/helpers/constants';
import { ProductEntity } from 'src/admin/stock/product/entities/product.entity';

@Injectable()
export class UserOrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrderProductsEntity)
    private orderProductsRepository: Repository<OrderProductsEntity>,
    private userBasketService: UserBasketService,
    private dataSource: DataSource,
  ) {}

  async orderBasketProducts(currentUser: UserEntity, addressId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const order = new OrderEntity();
      order.addressId = addressId;
      order.userId = currentUser.id;
      order.orderAt = new Date();
      await queryRunner.manager.save(order);
      const userBasket =
        await this.userBasketService.getUserBasketProducts(currentUser);
      for (const productFromBasket of userBasket) {
        const product = await queryRunner.manager.findOne(ProductEntity, {
          where: { id: productFromBasket.basketProduct.id },
        });
        if (
          product.currentSaleQuantity < productFromBasket.productQuantity &&
          product.currentSum < productFromBasket.productSum
        ) {
          throw new BadRequestException(
            'Check product quantities in basket they are more than in sale',
          );
        }
        const orderProduct = new OrderProductsEntity();
        orderProduct.orderId = order.id;
        orderProduct.productQuantity = productFromBasket.productQuantity;
        orderProduct.productSum = productFromBasket.productSum;
        orderProduct.productId = productFromBasket.basketProduct.id;
        product.currentSaleQuantity -= productFromBasket.productQuantity;
        product.currentSum -= productFromBasket.productSum;
        await queryRunner.manager.save(orderProduct);
        await queryRunner.manager.save(product);
      }

      return {
        message: 'Products ordered successfully',
        order: order,
      };
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        'Something went while ordering products' + error.message,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getOrders(currentUser: UserTokenDto, query?: GetOrders) {
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
      )
      .where('orders.userId = :userId', { userId: currentUser.id });
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

  async getOneOrder(orderId: string, currentUser: UserTokenDto) {
    const order = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.orderProducts', 'orderProducts')
      .leftJoinAndSelect('order.deliveredAddress', 'deliveredAddress')
      .loadRelationCountAndMap(
        'order.orderProductsCount',
        'order.orderProducts',
      )
      .leftJoinAndSelect('orderProducts.product', 'products')
      .where('order.id = :orderId AND order.userId = :userId', {
        orderId: orderId,
        userId: currentUser.id,
      })
      .getOne();

    return {
      message: 'Order returned successfully',
      order: order,
    };
  }

  async getOrderById(orderId: string, userId: string) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, userId: userId },
    });
    if (!order)
      throw new NotFoundException(`Order with id ${orderId} not found`);
    return order;
  }

  async deleteOrder(orderId: string, currentUser: UserTokenDto) {
    const order = await this.getOrderById(orderId, currentUser.id);
    if (order.status === OrderStatus.DELIVERING)
      throw new BadRequestException(
        'Order already on road. We can delete it now.',
      );
    await this.orderRepository.delete(order.id);
    return {
      message: 'Order deleted successfully',
    };
  }
}
