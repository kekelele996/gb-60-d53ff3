import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum CouponType {
  FULL_REDUCTION = 'full_reduction',
  DISCOUNT = 'discount',
  FREE_SHIPPING = 'free_shipping',
}

export enum CouponStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
}

@Entity('coupons')
export class Coupon extends BaseEntity {
  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: CouponType,
    default: CouponType.FULL_REDUCTION,
  })
  type: CouponType;

  @Column({ name: 'min_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  minAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  discountRate: number;

  @Column({ name: 'max_discount_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxDiscountAmount: number;

  @Column({ name: 'total_count', default: 0 })
  totalCount: number;

  @Column({ name: 'used_count', default: 0 })
  usedCount: number;

  @Column({ name: 'per_user_limit', default: 1 })
  perUserLimit: number;

  @Column({ name: 'valid_from', nullable: true })
  validFrom: Date;

  @Column({ name: 'valid_to', nullable: true })
  validTo: Date;

  @Column({
    type: 'enum',
    enum: CouponStatus,
    default: CouponStatus.DRAFT,
  })
  status: CouponStatus;

  @Column({ name: 'is_new_user_only', default: false })
  isNewUserOnly: boolean;
}

@Entity('user_coupons')
export class UserCoupon extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'coupon_id' })
  couponId: string;

  @Column({ name: 'order_id', nullable: true })
  orderId: string;

  @Column({ name: 'is_used', default: false })
  isUsed: boolean;

  @Column({ name: 'used_at', nullable: true })
  usedAt: Date;

  @Column({ name: 'claimed_at' })
  claimedAt: Date;
}

@Entity('promotions')
export class Promotion extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'start_time' })
  startTime: Date;

  @Column({ name: 'end_time' })
  endTime: Date;

  @Column({ name: 'min_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  minAmount: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ name: 'discount_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  discountRate: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
