import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Order } from './order.entity';

export enum PaymentMethod {
  ALIPAY = 'alipay',
  WECHAT = 'wechat',
}

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Entity('payments')
export class Payment extends BaseEntity {
  @Column({ name: 'payment_no', unique: true })
  paymentNo: string;

  @Column({ name: 'order_id' })
  orderId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.ALIPAY,
  })
  method: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ name: 'third_party_no', nullable: true })
  thirdPartyNo: string;

  @Column({ name: 'paid_at', nullable: true })
  paidAt: Date;

  @Column({ name: 'failed_reason', nullable: true })
  failedReason: string;

  @ManyToOne(() => Order, (order) => order.payments)
  order: Order;
}
