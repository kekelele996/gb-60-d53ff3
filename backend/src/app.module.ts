import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

import { User } from './modules/user/entities/user.entity';
import { Category } from './modules/product/entities/category.entity';
import { Product } from './modules/product/entities/product.entity';
import { Order } from './modules/order/entities/order.entity';
import { OrderItem } from './modules/order/entities/order-item.entity';
import { Cart } from './modules/order/entities/cart.entity';
import { Payment } from './modules/order/entities/payment.entity';
import { Shipping } from './modules/order/entities/shipping.entity';
import { Review } from './modules/review/entities/review.entity';
import { Coupon, UserCoupon, Promotion } from './modules/promotion/entities/coupon.entity';

import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductModule } from './modules/product/product.module';
import { OrderModule } from './modules/order/order.module';
import { ReviewModule } from './modules/review/review.module';
import { PromotionModule } from './modules/promotion/promotion.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
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
        logging: false,
      }),
    }),
    UserModule,
    AuthModule,
    ProductModule,
    OrderModule,
    ReviewModule,
    PromotionModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
