import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Shipping, ShippingStatus, TrackingEvent } from './entities/shipping.entity';
import { Order, OrderStatus } from './entities/order.entity';
import { ShipOrderDto } from './dto/order.dto';
import { generateShippingNo } from '../../common/helpers/utils.helper';

@Injectable()
export class ShippingService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Shipping)
    private shippingRepository: Repository<Shipping>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  async create(orderId: string, shipDto: ShipOrderDto) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== OrderStatus.PAID && order.status !== OrderStatus.PENDING_SHIPMENT) {
      throw new BadRequestException('订单状态不允许发货');
    }

    const existingShipping = await this.shippingRepository.findOne({
      where: { orderId },
    });

    if (existingShipping) {
      throw new BadRequestException('该订单已发货');
    }

    const now = new Date();
    const initialTracking: TrackingEvent[] = [
      {
        time: now,
        location: shipDto.senderAddress || '仓库',
        status: '已发货',
        description: `快件已由${shipDto.carrierName}揽收`,
      },
    ];

    const shipping = this.shippingRepository.create({
      shippingNo: generateShippingNo(),
      orderId,
      carrierName: shipDto.carrierName,
      trackingNo: shipDto.trackingNo,
      status: ShippingStatus.SHIPPED,
      senderName: shipDto.senderName,
      senderPhone: shipDto.senderPhone,
      senderAddress: shipDto.senderAddress,
      receiverName: order.receiverName,
      receiverPhone: order.receiverPhone,
      receiverAddress: order.receiverAddress,
      trackingHistory: initialTracking,
      shippedAt: now,
    });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(shipping);

      order.status = OrderStatus.SHIPPED;
      order.shippedAt = now;
      await queryRunner.manager.save(order);

      await queryRunner.commitTransaction();
      return shipping;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findByOrder(orderId: string, userId?: string) {
    const shipping = await this.shippingRepository.findOne({
      where: { orderId },
    });

    if (!shipping) {
      throw new NotFoundException('该订单暂无物流信息');
    }

    if (userId) {
      const order = await this.orderRepository.findOne({
        where: { id: orderId },
      });
      if (order && order.userId !== userId) {
        throw new ForbiddenException('无权查看此物流信息');
      }
    }

    return shipping;
  }

  async updateTracking(shippingId: string, event: Omit<TrackingEvent, 'time'>) {
    const shipping = await this.shippingRepository.findOne({
      where: { id: shippingId },
    });

    if (!shipping) {
      throw new NotFoundException('物流记录不存在');
    }

    const newEvent: TrackingEvent = {
      ...event,
      time: new Date(),
    };

    shipping.trackingHistory = [
      newEvent,
      ...(shipping.trackingHistory || []),
    ];

    if (event.status === '已签收' || event.status.includes('签收')) {
      shipping.status = ShippingStatus.DELIVERED;
      shipping.deliveredAt = new Date();
    }

    return this.shippingRepository.save(shipping);
  }

  async simulateProgress(shippingId: string) {
    const shipping = await this.shippingRepository.findOne({
      where: { id: shippingId },
    });

    if (!shipping) {
      throw new NotFoundException('物流记录不存在');
    }

    if (shipping.status === ShippingStatus.DELIVERED) {
      throw new BadRequestException('该订单已完成配送');
    }

    const stages: Omit<TrackingEvent, 'time'>[] = [
      { location: '转运中心', status: '运输中', description: '快件已到达转运中心' },
      { location: '目的地城市', status: '运输中', description: '快件已到达目的地城市' },
      { location: '派送点', status: '派送中', description: '快件正在派送中' },
      { location: '收件地址', status: '已签收', description: '快件已被签收' },
    ];

    const currentCount = shipping.trackingHistory?.length || 1;
    const nextStageIndex = Math.min(currentCount - 1, stages.length - 1);

    if (nextStageIndex >= stages.length) {
      throw new BadRequestException('物流已完成');
    }

    return this.updateTracking(shippingId, stages[nextStageIndex]);
  }
}
