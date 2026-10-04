import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../user/entities/user.entity';
import {
  CreateCouponDto,
  UpdateCouponDto,
  ClaimCouponDto,
  CreatePromotionDto,
  ApplyCouponDto,
} from './dto/promotion.dto';

@Controller('api/coupons')
export class CouponController {
  constructor(private promotionService: PromotionService) {}

  @Get('available')
  async getAvailable(@Query('userId') userId?: string) {
    return this.promotionService.findAvailableCoupons(userId);
  }

  @Post('claim')
  @UseGuards(JwtAuthGuard)
  async claim(
    @CurrentUser() user: any,
    @Body() claimDto: ClaimCouponDto,
  ) {
    return this.promotionService.claimCoupon(user.id, claimDto);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  async getMine(
    @CurrentUser() user: any,
    @Query('isUsed') isUsed?: string,
  ) {
    const used = isUsed === 'true' ? true : isUsed === 'false' ? false : undefined;
    return this.promotionService.getUserCoupons(user.id, used);
  }

  @Post('apply')
  @UseGuards(JwtAuthGuard)
  async apply(
    @CurrentUser() user: any,
    @Body() applyDto: ApplyCouponDto,
  ) {
    return this.promotionService.applyCoupon(user.id, applyDto);
  }
}

@Controller('api/promotions')
export class PromotionController {
  constructor(private promotionService: PromotionService) {}

  @Get('active')
  async getActive() {
    return this.promotionService.getActivePromotions();
  }
}

@Controller('api/admin/coupons')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class CouponAdminController {
  constructor(private promotionService: PromotionService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.promotionService.findAllCoupons(
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 10,
    );
  }

  @Post()
  async create(@Body() createDto: CreateCouponDto) {
    return this.promotionService.createCoupon(createDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateCouponDto,
  ) {
    return this.promotionService.updateCoupon(id, updateDto);
  }
}

@Controller('api/admin/promotions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class PromotionAdminController {
  constructor(private promotionService: PromotionService) {}

  @Post()
  async create(@Body() createDto: CreatePromotionDto) {
    return this.promotionService.createPromotion(createDto);
  }

  @Get()
  async findAll() {
    return this.promotionService.getActivePromotions();
  }
}
