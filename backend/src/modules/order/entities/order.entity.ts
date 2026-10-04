import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { OrderItem } from './order-item.entity';
import { Payment } from './payment.entity';
import { Shipping } from './shipping.entity';
import { Review } from '../../review/entities/review.entity';

export enum OrderStatus {
  PENDING_PAYMENT = 'pending_payment',
  PAID = 'paid',
  PENDING_SHIPMENT = 'pending_shipment',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDING = 'refunding',
  REFUNDED = 'refunded',
}

@Entity('orders')
export class Order extends BaseEntity {
  @Column({ name: 'order_no', unique: true })
  orderNo: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.orders)
  user: User;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ name: 'shipping_fee', type: 'decimal', precision: 10, scale: 2, default: 0 })
  shippingFee: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ name: 'coupon_code', nullable: true })
  couponCode: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING_PAYMENT,
  })
  status: OrderStatus;

  @Column({ name: 'receiver_name' })
  receiverName: string;

  @Column({ name: 'receiver_phone' })
  receiverPhone: string;

  @Column({ name: 'receiver_address', type: 'text' })
  receiverAddress: string;

  @Column({ name: 'remark', type: 'text', nullable: true })
  remark: string;

  @Column({ name: 'paid_at', nullable: true })
  paidAt: Date;

  @Column({ name: 'shipped_at', nullable: true })
  shippedAt: Date;

  @Column({ name: 'delivered_at', nullable: true })
  deliveredAt: Date;

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date;

  @Column({ name: 'cancelled_at', nullable: true })
  cancelledAt: Date;

  @Column({ name: 'cancelled_reason', nullable: true })
  cancelledReason: string;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  items: OrderItem[];

  @OneToMany(() => Payment, (payment) => payment.order)
  payments: Payment[];

  @OneToMany(() => Shipping, (shipping) => shipping.order)
  shippings: Shipping[];

  @OneToMany(() => Review, (review) => review.order)
  reviews: Review[];
}
