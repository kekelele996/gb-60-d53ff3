import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Order } from '../../order/entities/order.entity';
import { Cart } from '../../order/entities/cart.entity';
import { Review } from '../../review/entities/review.entity';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ name: 'nickname', nullable: true })
  nickname: string;

  @Column({ name: 'avatar', nullable: true })
  avatar: string;

  @Column({ name: 'phone', nullable: true })
  phone: string;

  @Column({ name: 'address', type: 'text', nullable: true })
  address: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'refresh_token', nullable: true })
  refreshToken: string;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Cart, (cart) => cart.user)
  carts: Cart[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];
}
