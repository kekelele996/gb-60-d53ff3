import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Order } from './order.entity';

export enum ShippingStatus {
  PENDING = 'pending',
  SHIPPED = 'shipped',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  FAILED = 'failed',
}

export interface TrackingEvent {
  time: Date;
  location: string;
  status: string;
  description: string;
}

@Entity('shippings')
export class Shipping extends BaseEntity {
  @Column({ name: 'shipping_no', unique: true })
  shippingNo: string;

  @Column({ name: 'order_id' })
  orderId: string;

  @Column({ name: 'carrier_name' })
  carrierName: string;

  @Column({ name: 'tracking_no', nullable: true })
  trackingNo: string;

  @Column({
    type: 'enum',
    enum: ShippingStatus,
    default: ShippingStatus.PENDING,
  })
  status: ShippingStatus;

  @Column({ name: 'sender_name', nullable: true })
  senderName: string;

  @Column({ name: 'sender_phone', nullable: true })
  senderPhone: string;

  @Column({ name: 'sender_address', type: 'text', nullable: true })
  senderAddress: string;

  @Column({ name: 'receiver_name' })
  receiverName: string;

  @Column({ name: 'receiver_phone' })
  receiverPhone: string;

  @Column({ name: 'receiver_address', type: 'text' })
  receiverAddress: string;

  @Column({ type: 'jsonb', nullable: true })
  trackingHistory: TrackingEvent[];

  @Column({ name: 'shipped_at', nullable: true })
  shippedAt: Date;

  @Column({ name: 'delivered_at', nullable: true })
  deliveredAt: Date;

  @ManyToOne(() => Order, (order) => order.shippings)
  order: Order;
}
