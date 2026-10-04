import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Product } from './product.entity';

@Entity('categories')
export class Category extends BaseEntity {
  @Column()
  name: string;

  @Column({ name: 'name_en', nullable: true })
  nameEn: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ default: 0 })
  sort: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'parent_id', nullable: true })
  parentId: string;

  @ManyToOne(() => Category, (category) => category.children, { nullable: true })
  parent: Category;

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
