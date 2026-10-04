import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThanOrEqual, IsNull } from 'typeorm';
import {
  Coupon,
  CouponType,
  CouponStatus,
  UserCoupon,
  Promotion,
} from './entities/coupon.entity';
import {
  CreateCouponDto,
  UpdateCouponDto,
  ClaimCouponDto,
  CreatePromotionDto,
  ApplyCouponDto,
} from './dto/promotion.dto';
import { generateCouponCode, calcPages } from '../../common/helpers/utils.helper';

@Injectable()
export class PromotionService {
  constructor(
    @InjectRepository(Coupon)
    private couponRepository: Repository<Coupon>,
    @InjectRepository(UserCoupon)
    private userCouponRepository: Repository<UserCoupon>,
    @InjectRepository(Promotion)
    private promotionRepository: Repository<Promotion>,
  ) {}

  async createCoupon(createDto: CreateCouponDto) {
    if (
      createDto.type === CouponType.FULL_REDUCTION &&
      !createDto.discountAmount
    ) {
      throw new BadRequestException('满减优惠券必须指定减免金额');
    }

    if (
      createDto.type === CouponType.DISCOUNT &&
      (!createDto.discountRate || createDto.discountRate <= 0 || createDto.discountRate > 1)
    ) {
      throw new BadRequestException('折扣优惠券必须指定0-1之间的折扣率');
    }

    let code = generateCouponCode(8);
    while (await this.couponRepository.findOne({ where: { code } })) {
      code = generateCouponCode(8);
    }

    const coupon = this.couponRepository.create({
      ...createDto,
      code,
      status: CouponStatus.ACTIVE,
      usedCount: 0,
    });

    return this.couponRepository.save(coupon);
  }

  async updateCoupon(id: string, updateDto: UpdateCouponDto) {
    const coupon = await this.couponRepository.findOne({ where: { id } });
    if (!coupon) {
      throw new NotFoundException('优惠券不存在');
    }

    Object.assign(coupon, updateDto);
    return this.couponRepository.save(coupon);
  }

  async findAllCoupons(page: number = 1, pageSize: number = 10) {
    const [coupons, total] = await this.couponRepository.findAndCount({
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });

    return {
      list: coupons,
      total,
      page,
      pageSize,
      pages: calcPages(total, pageSize),
    };
  }

  async findAvailableCoupons(userId?: string) {
    const now = new Date();
    const coupons = await this.couponRepository.find({
      where: {
        status: CouponStatus.ACTIVE,
      },
      order: { createdAt: 'DESC' },
    });

    const available = coupons.filter((coupon) => {
      if (coupon.usedCount >= coupon.totalCount) return false;
      if (coupon.validFrom && coupon.validFrom > now) return false;
      if (coupon.validTo && coupon.validTo < now) return false;
      return true;
    });

    if (userId) {
      const userCoupons = await this.userCouponRepository.find({
        where: { userId },
      });
      const claimedIds = new Set(userCoupons.map((uc) => uc.couponId));

      return available.map((coupon) => ({
        ...coupon,
        isClaimed: claimedIds.has(coupon.id),
        claimedCount: userCoupons.filter((uc) => uc.couponId === coupon.id).length,
      }));
    }

    return available;
  }

  async claimCoupon(userId: string, claimDto: ClaimCouponDto) {
    const coupon = await this.couponRepository.findOne({
      where: { code: claimDto.code },
    });

    if (!coupon) {
      throw new NotFoundException('优惠券不存在');
    }

    if (coupon.status !== CouponStatus.ACTIVE) {
      throw new BadRequestException('优惠券不可领取');
    }

    const now = new Date();
    if (coupon.validFrom && coupon.validFrom > now) {
      throw new BadRequestException('优惠券尚未开始领取');
    }
    if (coupon.validTo && coupon.validTo < now) {
      throw new BadRequestException('优惠券已过期');
    }

    if (coupon.usedCount >= coupon.totalCount) {
      throw new BadRequestException('优惠券已被领完');
    }

    const userClaimedCount = await this.userCouponRepository.count({
      where: { userId, couponId: coupon.id },
    });

    if (userClaimedCount >= coupon.perUserLimit) {
      throw new BadRequestException(`每人最多领取${coupon.perUserLimit}张`);
    }

    const userCoupon = this.userCouponRepository.create({
      userId,
      couponId: coupon.id,
      claimedAt: new Date(),
    });

    coupon.usedCount++;
    await this.couponRepository.save(coupon);

    return this.userCouponRepository.save(userCoupon);
  }

  async getUserCoupons(userId: string, isUsed?: boolean) {
    const where: any = { userId };
    if (isUsed !== undefined) {
      where.isUsed = isUsed;
    }

    const userCoupons = await this.userCouponRepository.find({
      where,
      order: { claimedAt: 'DESC' },
    });

    const couponIds = [...new Set(userCoupons.map((uc) => uc.couponId))];
    const coupons = await this.couponRepository.findBy({ id: In(couponIds) });
    const couponMap = new Map(coupons.map((c) => [c.id, c]));

    return userCoupons.map((uc) => ({
      ...uc,
      coupon: couponMap.get(uc.couponId),
    }));
  }

  async applyCoupon(userId: string, applyDto: ApplyCouponDto) {
    const { code, amount } = applyDto;

    const coupon = await this.couponRepository.findOne({ where: { code } });
    if (!coupon) {
      throw new NotFoundException('优惠券不存在');
    }

    const userCoupon = await this.userCouponRepository.findOne({
      where: { userId, couponId: coupon.id, isUsed: false },
    });

    if (!userCoupon) {
      throw new BadRequestException('您没有该优惠券或已使用');
    }

    if (amount < coupon.minAmount) {
      throw new BadRequestException(`订单金额需满${coupon.minAmount}元可用`);
    }

    const now = new Date();
    if (coupon.validTo && coupon.validTo < now) {
      throw new BadRequestException('优惠券已过期');
    }

    let discount = 0;
    if (coupon.type === CouponType.FULL_REDUCTION) {
      discount = coupon.discountAmount || 0;
    } else if (coupon.type === CouponType.DISCOUNT) {
      discount = amount * (1 - (coupon.discountRate || 1));
      if (coupon.maxDiscountAmount) {
        discount = Math.min(discount, coupon.maxDiscountAmount);
      }
    } else if (coupon.type === CouponType.FREE_SHIPPING) {
      discount = 0;
    }

    return {
      coupon: {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        type: coupon.type,
      },
      discountAmount: Number(discount.toFixed(2)),
      finalAmount: Number((amount - discount).toFixed(2)),
    };
  }

  async createPromotion(createDto: CreatePromotionDto) {
    const promotion = this.promotionRepository.create({
      ...createDto,
      startTime: new Date(createDto.startTime),
      endTime: new Date(createDto.endTime),
      isActive: true,
    });

    return this.promotionRepository.save(promotion);
  }

  async getActivePromotions() {
    const now = new Date();
    return this.promotionRepository.find({
      where: {
        isActive: true,
      },
      order: { startTime: 'ASC' },
    });
  }

  async calculatePromotionDiscount(amount: number) {
    const now = new Date();
    const promotions = await this.promotionRepository.find({
      where: {
        isActive: true,
      },
    });

    const activePromotions = promotions.filter(
      (p) => p.startTime <= now && p.endTime >= now,
    );

    let maxDiscount = 0;
    for (const promotion of activePromotions) {
      if (amount >= promotion.minAmount) {
        let discount = 0;
        if (promotion.discountAmount) {
          discount = promotion.discountAmount;
        } else if (promotion.discountRate) {
          discount = amount * (1 - promotion.discountRate);
        }
        maxDiscount = Math.max(maxDiscount, discount);
      }
    }

    return maxDiscount;
  }
}

function In(ids: string[]) {
  return { $in: ids } as any;
}
