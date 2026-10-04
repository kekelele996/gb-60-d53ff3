import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Cart } from './entities/cart.entity';
import { Payment } from './entities/payment.entity';
import { Shipping } from './entities/shipping.entity';
import { Product } from '../product/entities/product.entity';
import { Category } from '../product/entities/category.entity';
import { User } from '../user/entities/user.entity';
import { CartService } from './cart.service';
import { OrderService } from './order.service';
import { PaymentService } from './payment.service';
import { ShippingService } from './shipping.service';
import {
  CartController,
  OrderController,
  PaymentController,
  OrderAdminController,
} from './order.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      Cart,
      Payment,
      Shipping,
      Product,
      Category,
      User,
    ]),
  ],
  providers: [CartService, OrderService, PaymentService, ShippingService],
  controllers: [
    CartController,
    OrderController,
    PaymentController,
    OrderAdminController,
  ],
  exports: [OrderService, PaymentService, ShippingService],
})
export class OrderModule {}
