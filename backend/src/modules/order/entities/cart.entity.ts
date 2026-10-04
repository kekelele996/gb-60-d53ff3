import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { Product } from '../../product/entities/product.entity';

@Entity('carts')
export class Cart extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'product_id' })
  productId: string;

  @Column()
  quantity: number;

  @Column({ name: 'selected', default: true })
  selected: boolean;

  @ManyToOne(() => User, (user) => user.carts)
  user: User;

  @ManyToOne(() => Product, (product) => product.carts)
  product: Product;
}
