import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsInt,
  Min,
  IsEnum,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { CouponType, CouponStatus } from '../entities/coupon.entity';

export class CreateCouponDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(CouponType)
  type: CouponType;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minAmount: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  discountRate?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxDiscountAmount?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  totalCount: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  perUserLimit?: number;

  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @IsOptional()
  @IsDateString()
  validTo?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isNewUserOnly?: boolean;
}

export class UpdateCouponDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(CouponStatus)
  status?: CouponStatus;

  @IsOptional()
  @IsDateString()
  validTo?: string;
}

export class ClaimCouponDto {
  @IsString()
  code: string;
}

export class CreatePromotionDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minAmount: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  discountRate?: number;
}

export class ApplyCouponDto {
  @IsString()
  code: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount: number;
}
