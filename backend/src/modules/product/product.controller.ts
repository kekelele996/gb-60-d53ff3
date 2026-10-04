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
import { ProductService } from './product.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';
import {
  CreateProductDto,
  UpdateProductDto,
  QueryProductDto,
} from './dto/product.dto';
import { ProductStatus } from './entities/product.entity';

@Controller('api/products')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get()
  async findAll(@Query() queryDto: QueryProductDto) {
    return this.productService.findAll(queryDto);
  }

  @Get('recommended')
  async getRecommended(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.productService.getRecommended(limitNum);
  }

  @Get('hot')
  async getHot(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.productService.getHot(limitNum);
  }

  @Get('new')
  async getNewArrivals(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.productService.getNewArrivals(limitNum);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productService.findOne(id, true);
  }
}

@Controller('api/admin/products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class ProductAdminController {
  constructor(private productService: ProductService) {}

  @Get()
  async findAll(@Query() queryDto: QueryProductDto) {
    return this.productService.adminFindAll(queryDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Post()
  async create(@Body() createDto: CreateProductDto) {
    return this.productService.create(createDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateProductDto,
  ) {
    return this.productService.update(id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() data: { status: ProductStatus },
  ) {
    return this.productService.updateStatus(id, data.status);
  }

  @Patch(':id/stock')
  async updateStock(
    @Param('id') id: string,
    @Body() data: { quantity: number },
  ) {
    return this.productService.updateStock(id, data.quantity);
  }
}
