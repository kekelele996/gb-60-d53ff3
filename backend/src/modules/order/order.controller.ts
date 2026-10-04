import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { OrderService } from './order.service';
import { PaymentService } from './payment.service';
import { ShippingService } from './shipping.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../user/entities/user.entity';
import {
  AddCartDto,
  UpdateCartDto,
  CreateOrderDto,
  QueryOrderDto,
  CancelOrderDto,
  ShipOrderDto,
} from './dto/order.dto';
import { PaymentMethod } from './entities/payment.entity';

@Controller('api/cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  async findAll(@CurrentUser() user: any) {
    return this.cartService.findByUser(user.id);
  }

  @Post()
  async add(@CurrentUser() user: any, @Body() addDto: AddCartDto) {
    return this.cartService.add(user.id, addDto);
  }

  @Put(':id')
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateCartDto,
  ) {
    return this.cartService.update(user.id, id, updateDto);
  }

  @Delete()
  async remove(
    @CurrentUser() user: any,
    @Query('ids') ids: string,
  ) {
    const idList = ids ? ids.split(',') : [];
    return this.cartService.remove(user.id, idList);
  }

  @Delete('clear')
  async clear(@CurrentUser() user: any) {
    return this.cartService.clear(user.id);
  }

  @Patch('select-all')
  async selectAll(
    @CurrentUser() user: any,
    @Body() data: { selected: boolean },
  ) {
    return this.cartService.selectAll(user.id, data.selected);
  }
}

@Controller('api/orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(
    private orderService: OrderService,
    private paymentService: PaymentService,
    private shippingService: ShippingService,
  ) {}

  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Query() queryDto: QueryOrderDto,
  ) {
    return this.orderService.findAll(user.id, queryDto);
  }

  @Get(':id')
  async findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.orderService.findOne(id, user.id);
  }

  @Post()
  async create(
    @CurrentUser() user: any,
    @Body() createDto: CreateOrderDto,
  ) {
    return this.orderService.create(user.id, createDto);
  }

  @Post(':id/cancel')
  async cancel(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() cancelDto: CancelOrderDto,
  ) {
    return this.orderService.cancel(user.id, id, cancelDto);
  }

  @Post(':id/confirm')
  async confirmReceive(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.orderService.confirmReceive(user.id, id);
  }

  @Post(':id/payment')
  async createPayment(
    @CurrentUser() user: any,
    @Param('id') orderId: string,
    @Body() data?: { method?: string },
  ) {
    const method = (data?.method as PaymentMethod) || PaymentMethod.ALIPAY;
    return this.paymentService.create(user.id, orderId, method);
  }

  @Get(':id/shipping')
  async getShipping(
    @CurrentUser() user: any,
    @Param('id') orderId: string,
  ) {
    return this.shippingService.findByOrder(orderId, user.id);
  }
}

@Controller('api/payments')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Get('mock-pay/:id')
  async mockPay(
    @Param('id') paymentId: string,
    @Query('success') success?: string,
  ) {
    const isSuccess = success !== 'false';
    return this.paymentService.mockPay(paymentId, isSuccess);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.paymentService.findByUser(user.id);
  }
}

@Controller('api/admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class OrderAdminController {
  constructor(
    private orderService: OrderService,
    private shippingService: ShippingService,
  ) {}

  @Get()
  async findAll(@Query() queryDto: QueryOrderDto) {
    return this.orderService.adminFindAll(queryDto);
  }

  @Get('statistics')
  async getStatistics() {
    return this.orderService.getStatistics();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Post(':id/ship')
  async ship(@Param('id') orderId: string, @Body() shipDto: ShipOrderDto) {
    return this.shippingService.create(orderId, shipDto);
  }

  @Patch(':id/shipping/:shippingId/simulate')
  async simulateShipping(
    @Param('shippingId') shippingId: string,
  ) {
    return this.shippingService.simulateProgress(shippingId);
  }
}
