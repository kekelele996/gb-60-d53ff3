import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Category } from './category.entity';
import { OrderItem } from '../../order/entities/order-item.entity';
import { Cart } from '../../order/entities/cart.entity';
import { Review } from '../../review/entities/review.entity';

export enum ProductStatus {
  DRAFT = 'draft',
  ON_SALE = 'on_sale',
  OFF_SALE = 'off_sale',
}

@Entity('products')
export class Product extends BaseEntity {
  @Column()
  name: string;

  @Column({ name: 'short_description', type: 'text', nullable: true })
  shortDescription: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ name: 'original_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  originalPrice: number;

  @Column({ default: 0 })
  stock: number;

  @Column({ name: 'sales_count', default: 0 })
  salesCount: number;

  @Column({ name: 'view_count', default: 0 })
  viewCount: number;

  @Column({ name: 'avg_rating', type: 'decimal', precision: 3, scale: 2, default: 0 })
  avgRating: number;

  @Column({ name: 'review_count', default: 0 })
  reviewCount: number;

  @Column('simple-array', { nullable: true })
  images: string[];

  @Column({ nullable: true })
  thumbnail: string;

  @Column({ name: 'shipping_origin', nullable: true })
  shippingOrigin: string;

  @Column({ name: 'is_free_shipping', default: false })
  isFreeShipping: boolean;

  @Column({ name: 'shipping_fee', type: 'decimal', precision: 10, scale: 2, default: 0 })
  shippingFee: number;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.DRAFT,
  })
  status: ProductStatus;

  @Column({ name: 'category_id', nullable: true })
  categoryId: string;

  @ManyToOne(() => Category, (category) => category.products, { nullable: true })
  category: Category;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];

  @OneToMany(() => Cart, (cart) => cart.product)
  carts: Cart[];

  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];
}
