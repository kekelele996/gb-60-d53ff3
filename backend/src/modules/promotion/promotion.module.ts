import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coupon, UserCoupon, Promotion } from './entities/coupon.entity';
import { PromotionService } from './promotion.service';
import {
  CouponController,
  PromotionController,
  CouponAdminController,
  PromotionAdminController,
} from './promotion.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Coupon, UserCoupon, Promotion])],
  providers: [PromotionService],
  controllers: [
    CouponController,
    PromotionController,
    CouponAdminController,
    PromotionAdminController,
  ],
  exports: [PromotionService],
})
export class PromotionModule {}
