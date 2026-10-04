import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { Product } from '../../product/entities/product.entity';
import { Order } from '../../order/entities/order.entity';

@Entity('reviews')
export class Review extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'product_id' })
  productId: string;

  @Column({ name: 'order_id' })
  orderId: string;

  @Column({ name: 'order_item_id' })
  orderItemId: string;

  @Column({ type: 'int', default: 5 })
  rating: number;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column('simple-array', { nullable: true })
  images: string[];

  @Column({ name: 'is_anonymous', default: false })
  isAnonymous: boolean;

  @Column({ name: 'is_visible', default: true })
  isVisible: boolean;

  @Column({ name: 'admin_reply', type: 'text', nullable: true })
  adminReply: string;

  @Column({ name: 'admin_replied_at', nullable: true })
  adminRepliedAt: Date;

  @Column({ name: 'like_count', default: 0 })
  likeCount: number;

  @ManyToOne(() => User, (user) => user.reviews)
  user: User;

  @ManyToOne(() => Product, (product) => product.reviews)
  product: Product;

  @ManyToOne(() => Order, (order) => order.reviews)
  order: Order;
}
