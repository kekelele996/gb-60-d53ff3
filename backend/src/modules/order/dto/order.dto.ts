import { Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsInt,
  Min,
  IsEnum,
  ArrayNotEmpty,
} from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

export class AddCartDto {
  @IsString()
  productId: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;
}

export class UpdateCartDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @Type(() => Boolean)
  selected?: boolean;
}

export class CartItemDto {
  @IsString()
  productId: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;

  @Type(() => Boolean)
  selected: boolean;
}

export class CreateOrderDto {
  @IsArray()
  @ArrayNotEmpty()
  items: CartItemDto[];

  @IsString()
  receiverName: string;

  @IsString()
  receiverPhone: string;

  @IsString()
  receiverAddress: string;

  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsOptional()
  @IsString()
  remark?: string;
}

export class CreatePaymentDto {
  @IsString()
  orderId: string;

  @IsOptional()
  @IsString()
  method?: string;
}

export class QueryOrderDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;
}

export class CancelOrderDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

export class ShipOrderDto {
  @IsString()
  carrierName: string;

  @IsOptional()
  @IsString()
  trackingNo?: string;

  @IsOptional()
  @IsString()
  senderName?: string;

  @IsOptional()
  @IsString()
  senderPhone?: string;

  @IsOptional()
  @IsString()
  senderAddress?: string;
}
