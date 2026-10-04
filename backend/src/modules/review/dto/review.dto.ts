import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsArray,
  IsInt,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';

export class CreateReviewDto {
  @IsString()
  orderId: string;

  @IsString()
  orderItemId: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isAnonymous?: boolean;
}

export class ReplyReviewDto {
  @IsString()
  reply: string;
}

export class QueryReviewDto {
  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

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
