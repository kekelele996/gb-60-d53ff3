import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../product/entities/product.entity';
import { Cart } from './entities/cart.entity';
import { User } from '../user/entities/user.entity';
import {
  CreateOrderDto,
  QueryOrderDto,
  CancelOrderDto,
} from './dto/order.dto';
import {
  generateOrderNo,
  calcPages,
} from '../../common/helpers/utils.helper';

@Injectable()
export class OrderService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(userId: string, createDto: CreateOrderDto) {
    const { items, receiverName, receiverPhone, receiverAddress, couponCode, remark } = createDto;

    if (items.length === 0) {
      throw new BadRequestException('请选择商品');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const productIds = items.map((item) => item.productId);
      const products = await this.productRepository.findBy({
        id: In(productIds),
      });

      const productMap = new Map(products.map((p) => [p.id, p]));

      let subtotal = 0;
      let shippingFee = 0;
      const orderItems: OrderItem[] = [];

      for (const item of items) {
        const product = productMap.get(item.productId);
        if (!product) {
          throw new BadRequestException(`商品不存在`);
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(`商品【${product.name}】库存不足`);
        }

        const itemSubtotal = product.price * item.quantity;
        subtotal += itemSubtotal;

        if (!product.isFreeShipping) {
          shippingFee += product.shippingFee || 0;
        }

        orderItems.push(
          this.orderItemRepository.create({
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: item.quantity,
            subtotal: itemSubtotal,
            thumbnail: product.thumbnail,
          }),
        );

        product.stock -= item.quantity;
        product.salesCount += item.quantity;
      }

      let discountAmount = 0;
      if (couponCode) {
        discountAmount = 0;
      }

      const total = Number((subtotal + shippingFee - discountAmount).toFixed(2));

      const order = this.orderRepository.create({
        orderNo: generateOrderNo(),
        userId,
        subtotal: Number(subtotal.toFixed(2)),
        shippingFee: Number(shippingFee.toFixed(2)),
        discountAmount,
        couponCode,
        total,
        receiverName,
        receiverPhone,
        receiverAddress,
        remark,
        status: OrderStatus.PENDING_PAYMENT,
        items: orderItems,
      });

      await queryRunner.manager.save(products);
      const savedOrder = await queryRunner.manager.save(order);

      const selectedProductIds = items.map((i) => i.productId);
      await queryRunner.manager.delete(Cart, {
        userId,
        productId: In(selectedProductIds),
        selected: true,
      });

      await queryRunner.commitTransaction();

      return this.findOne(savedOrder.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(userId: string, queryDto: QueryOrderDto) {
    const { status, page = 1, pageSize = 10 } = queryDto;

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const [orders, total] = await this.orderRepository.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
      relations: ['items'],
    });

    return {
      list: orders,
      total,
      page,
      pageSize,
      pages: calcPages(total, pageSize),
    };
  }

  async findOne(id: string, userId?: string) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'payments', 'shippings'],
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (userId && order.userId !== userId) {
      throw new ForbiddenException('无权查看此订单');
    }

    return order;
  }

  async findByOrderNo(orderNo: string) {
    const order = await this.orderRepository.findOne({
      where: { orderNo },
      relations: ['items', 'payments', 'shippings'],
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    return order;
  }

  async cancel(userId: string, id: string, cancelDto: CancelOrderDto) {
    const order = await this.findOne(id, userId);

    if (order.status !== OrderStatus.PENDING_PAYMENT) {
      throw new BadRequestException('当前订单状态不可取消');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const item of order.items) {
        await queryRunner.manager.increment(
          Product,
          { id: item.productId },
          'stock',
          item.quantity,
        );
        await queryRunner.manager.decrement(
          Product,
          { id: item.productId },
          'salesCount',
          item.quantity,
        );
      }

      order.status = OrderStatus.CANCELLED;
      order.cancelledAt = new Date();
      order.cancelledReason = cancelDto.reason || '用户取消';

      await queryRunner.manager.save(order);
      await queryRunner.commitTransaction();

      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async confirmReceive(userId: string, id: string) {
    const order = await this.findOne(id, userId);

    if (order.status !== OrderStatus.SHIPPED) {
      throw new BadRequestException('当前订单状态不可确认收货');
    }

    order.status = OrderStatus.COMPLETED;
    order.deliveredAt = new Date();
    order.completedAt = new Date();

    await this.orderRepository.save(order);
    return this.findOne(id);
  }

  async updateStatus(id: string, status: OrderStatus) {
    const order = await this.findOne(id);
    order.status = status;
    await this.orderRepository.save(order);
    return this.findOne(id);
  }

  async getStatistics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalOrders = await this.orderRepository.count();
    const pendingPayment = await this.orderRepository.count({
      where: { status: OrderStatus.PENDING_PAYMENT },
    });
    const pendingShipment = await this.orderRepository.count({
      where: { status: In([OrderStatus.PAID, OrderStatus.PENDING_SHIPMENT]) },
    });
    const shipped = await this.orderRepository.count({
      where: { status: OrderStatus.SHIPPED },
    });

    const { totalRevenue } = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.total)', 'totalRevenue')
      .where('order.status IN (:...statuses)', {
        statuses: [
          OrderStatus.PAID,
          OrderStatus.PENDING_SHIPMENT,
          OrderStatus.SHIPPED,
          OrderStatus.DELIVERED,
          OrderStatus.COMPLETED,
        ],
      })
      .getRawOne();

    const { todayOrders } = await this.orderRepository
      .createQueryBuilder('order')
      .select('COUNT(*)', 'todayOrders')
      .where('order.createdAt >= :today', { today })
      .getRawOne();

    return {
      totalOrders,
      totalRevenue: Number(totalRevenue || 0),
      todayOrders: Number(todayOrders || 0),
      pendingPayment,
      pendingShipment,
      shipped,
    };
  }

  async adminFindAll(queryDto: QueryOrderDto) {
    const { status, keyword, page = 1, pageSize = 10 } = queryDto;

    const queryBuilder = this.orderRepository.createQueryBuilder('order');
    queryBuilder.leftJoinAndSelect('order.items', 'items');
    queryBuilder.leftJoinAndSelect('order.user', 'user');

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    if (keyword) {
      queryBuilder.andWhere(
        '(order.orderNo LIKE :keyword OR user.username LIKE :keyword OR user.email LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    queryBuilder.orderBy('order.createdAt', 'DESC');
    queryBuilder.skip((page - 1) * pageSize);
    queryBuilder.take(pageSize);

    const [orders, total] = await queryBuilder.getManyAndCount();

    return {
      list: orders,
      total,
      page,
      pageSize,
      pages: calcPages(total, pageSize),
    };
  }
}
