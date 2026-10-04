import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { runSeeds } from './seeds';

import { User } from '../modules/user/entities/user.entity';
import { Category } from '../modules/product/entities/category.entity';
import { Product } from '../modules/product/entities/product.entity';
import { Order } from '../modules/order/entities/order.entity';
import { OrderItem } from '../modules/order/entities/order-item.entity';
import { Cart } from '../modules/order/entities/cart.entity';
import { Payment } from '../modules/order/entities/payment.entity';
import { Shipping } from '../modules/order/entities/shipping.entity';
import { Review } from '../modules/review/entities/review.entity';
import { Coupon, UserCoupon, Promotion } from '../modules/promotion/entities/coupon.entity';

async function main() {
  const configService = new ConfigService();

  const dataSource = new DataSource({
    type: 'postgres',
    host: configService.get('DATABASE_HOST', 'localhost'),
    port: parseInt(configService.get('DATABASE_PORT', '5432'), 10),
    username: configService.get('DATABASE_USER', 'flower'),
    password: configService.get('DATABASE_PASSWORD', 'flower123'),
    database: configService.get('DATABASE_NAME', 'flower_shop'),
    entities: [
      User,
      Category,
      Product,
      Order,
      OrderItem,
      Cart,
      Payment,
      Shipping,
      Review,
      Coupon,
      UserCoupon,
      Promotion,
    ],
    synchronize: true,
    logging: true,
  });

  try {
    await dataSource.initialize();
    console.log('Database connected');

    await runSeeds(dataSource);

    await dataSource.destroy();
    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

main();
