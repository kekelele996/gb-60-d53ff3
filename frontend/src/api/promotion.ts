import request from '@/utils/request';
import { Coupon, UserCoupon } from '@/types';

export interface CalculateDiscountData {
  productIds: string[];
  couponId?: string;
}

export interface DiscountResult {
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  applicableCoupons: Coupon[];
}

export const promotionApi = {
  getActiveCoupons: () => request.get<Coupon[]>('/promotions/coupons'),
  getMyCoupons: (status?: 'UNUSED' | 'USED' | 'EXPIRED') => 
    request.get<UserCoupon[]>('/promotions/my-coupons', { params: { status } }),
  receiveCoupon: (couponId: string) => request.post<UserCoupon>(`/promotions/coupons/${couponId}/receive`),
  calculateDiscount: (data: CalculateDiscountData) => 
    request.post<DiscountResult>('/promotions/calculate', data),
};
