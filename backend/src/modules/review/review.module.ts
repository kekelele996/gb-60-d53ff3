import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Order } from '../order/entities/order.entity';
import { OrderItem } from '../order/entities/order-item.entity';
import { Product } from '../product/entities/product.entity';
import { ReviewService } from './review.service';
import { ReviewController, ReviewAdminController } from './review.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, Order, OrderItem, Product]),
  ],
  providers: [ReviewService],
  controllers: [ReviewController, ReviewAdminController],
  exports: [ReviewService],
})
export class ReviewModule {}
