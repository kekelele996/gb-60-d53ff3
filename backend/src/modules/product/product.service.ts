import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In, Between } from 'typeorm';
import { Product, ProductStatus } from './entities/product.entity';
import { Category } from './entities/category.entity';
import {
  CreateProductDto,
  UpdateProductDto,
  QueryProductDto,
} from './dto/product.dto';
import { calcPages } from '../../common/helpers/utils.helper';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async findAll(queryDto: QueryProductDto) {
    const {
      keyword,
      categoryId,
      minPrice,
      maxPrice,
      shippingOrigin,
      isFreeShipping,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      page = 1,
      pageSize = 10,
    } = queryDto;

    const where: any = { status: ProductStatus.ON_SALE };

    if (keyword) {
      where.name = Like(`%${keyword}%`);
    }

    if (categoryId) {
      const categoryIds = await this.getCategoryAndChildrenIds(categoryId);
      where.categoryId = In(categoryIds);
    }

    if (minPrice !== undefined && maxPrice !== undefined) {
      where.price = Between(minPrice, maxPrice);
    } else if (minPrice !== undefined) {
      where.price = Between(minPrice, 99999999);
    } else if (maxPrice !== undefined) {
      where.price = Between(0, maxPrice);
    }

    if (shippingOrigin) {
      where.shippingOrigin = shippingOrigin;
    }

    if (isFreeShipping !== undefined) {
      where.isFreeShipping = isFreeShipping;
    }

    const validSortFields = ['price', 'salesCount', 'avgRating', 'createdAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [products, total] = await this.productRepository.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { [sortField]: sortOrder.toUpperCase() as 'ASC' | 'DESC' },
      relations: ['category'],
    });

    return {
      list: products,
      total,
      page,
      pageSize,
      pages: calcPages(total, pageSize),
    };
  }

  async findOne(id: string, incrementView = false): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!product) {
      throw new NotFoundException('商品不存在');
    }

    if (incrementView) {
      product.viewCount++;
      await this.productRepository.save(product);
    }

    return product;
  }

  async create(createDto: CreateProductDto): Promise<Product> {
    if (createDto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: createDto.categoryId },
      });
      if (!category) {
        throw new BadRequestException('分类不存在');
      }
    }

    const product = this.productRepository.create({
      ...createDto,
      status: createDto.status || ProductStatus.DRAFT,
    });

    return this.productRepository.save(product);
  }

  async update(id: string, updateDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    if (updateDto.categoryId && updateDto.categoryId !== product.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateDto.categoryId },
      });
      if (!category) {
        throw new BadRequestException('分类不存在');
      }
    }

    Object.assign(product, updateDto);
    return this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  async updateStatus(id: string, status: ProductStatus): Promise<Product> {
    const product = await this.findOne(id);
    product.status = status;
    return this.productRepository.save(product);
  }

  async updateStock(id: string, quantity: number): Promise<Product> {
    const product = await this.findOne(id);
    if (product.stock + quantity < 0) {
      throw new BadRequestException('库存不足');
    }
    product.stock += quantity;
    return this.productRepository.save(product);
  }

  async incrementSales(id: string, quantity: number): Promise<void> {
    const product = await this.findOne(id);
    product.salesCount += quantity;
    await this.productRepository.save(product);
  }

  async getRecommended(limit = 10): Promise<Product[]> {
    return this.productRepository.find({
      where: { status: ProductStatus.ON_SALE },
      order: { salesCount: 'DESC' },
      take: limit,
      relations: ['category'],
    });
  }

  async getHot(limit = 10): Promise<Product[]> {
    return this.productRepository.find({
      where: { status: ProductStatus.ON_SALE },
      order: { viewCount: 'DESC' },
      take: limit,
      relations: ['category'],
    });
  }

  async getNewArrivals(limit = 10): Promise<Product[]> {
    return this.productRepository.find({
      where: { status: ProductStatus.ON_SALE },
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['category'],
    });
  }

  private async getCategoryAndChildrenIds(categoryId: string): Promise<string[]> {
    const ids: string[] = [categoryId];
    const children = await this.categoryRepository.find({
      where: { parentId: categoryId },
    });

    for (const child of children) {
      const childIds = await this.getCategoryAndChildrenIds(child.id);
      ids.push(...childIds);
    }

    return ids;
  }

  async adminFindAll(queryDto: QueryProductDto) {
    const {
      keyword,
      categoryId,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      page = 1,
      pageSize = 10,
    } = queryDto;

    const where: any = {};

    if (keyword) {
      where.name = Like(`%${keyword}%`);
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const validSortFields = ['price', 'salesCount', 'avgRating', 'createdAt', 'stock'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [products, total] = await this.productRepository.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { [sortField]: sortOrder.toUpperCase() as 'ASC' | 'DESC' },
      relations: ['category'],
    });

    return {
      list: products,
      total,
      page,
      pageSize,
      pages: calcPages(total, pageSize),
    };
  }
}
