import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { ProductService } from './product.service';
import { CategoryService } from './category.service';
import {
  ProductController,
  ProductAdminController,
} from './product.controller';
import {
  CategoryController,
  CategoryAdminController,
} from './category.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category])],
  providers: [ProductService, CategoryService],
  controllers: [
    ProductController,
    ProductAdminController,
    CategoryController,
    CategoryAdminController,
  ],
  exports: [ProductService, CategoryService, TypeOrmModule],
})
export class ProductModule {}
