import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Payment, PaymentMethod, PaymentStatus } from './entities/payment.entity';
import { Order, OrderStatus } from './entities/order.entity';
import { generatePaymentNo } from '../../common/helpers/utils.helper';

@Injectable()
export class PaymentService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  async create(userId: string, orderId: string, method: PaymentMethod = PaymentMethod.ALIPAY) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, userId },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== OrderStatus.PENDING_PAYMENT) {
      throw new BadRequestException('订单状态不允许支付');
    }

    const existingPayment = await this.paymentRepository.findOne({
      where: { orderId, status: PaymentStatus.PENDING },
    });

    if (existingPayment) {
      return {
        payment: existingPayment,
        order,
        mockPaymentUrl: `/api/payments/mock-pay/${existingPayment.id}`,
      };
    }

    const payment = this.paymentRepository.create({
      paymentNo: generatePaymentNo(),
      orderId,
      amount: order.total,
      method,
      status: PaymentStatus.PENDING,
    });

    await this.paymentRepository.save(payment);

    return {
      payment,
      order,
      mockPaymentUrl: `/api/payments/mock-pay/${payment.id}`,
    };
  }

  async mockPay(paymentId: string, success: boolean = true) {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('支付记录不存在');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('支付记录状态不正确');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (success) {
        payment.status = PaymentStatus.SUCCESS;
        payment.thirdPartyNo = `MOCK_${Date.now()}`;
        payment.paidAt = new Date();

        const order = await this.orderRepository.findOne({
          where: { id: payment.orderId },
        });

        if (order && order.status === OrderStatus.PENDING_PAYMENT) {
          order.status = OrderStatus.PAID;
          order.paidAt = new Date();
          await queryRunner.manager.save(order);
        }
      } else {
        payment.status = PaymentStatus.FAILED;
        payment.failedReason = '模拟支付失败';
      }

      await queryRunner.manager.save(payment);
      await queryRunner.commitTransaction();

      return payment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findByOrder(orderId: string) {
    return this.paymentRepository.find({
      where: { orderId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByUser(userId: string) {
    const payments = await this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoin('payment.order', 'order')
      .where('order.userId = :userId', { userId })
      .orderBy('payment.createdAt', 'DESC')
      .getMany();

    return payments;
  }
}
