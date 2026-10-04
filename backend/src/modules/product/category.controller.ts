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
import { CategoryService } from './category.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Controller('api/categories')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get()
  async findAll(@Query('active') active?: string) {
    return this.categoryService.findAll(active === 'true');
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }
}

@Controller('api/admin/categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class CategoryAdminController {
  constructor(private categoryService: CategoryService) {}

  @Get()
  async findAll() {
    return this.categoryService.findAll(false);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Post()
  async create(@Body() createDto: CreateCategoryDto) {
    return this.categoryService.create(createDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }

  @Patch(':id/toggle-active')
  async toggleActive(@Param('id') id: string) {
    return this.categoryService.toggleActive(id);
  }
}
