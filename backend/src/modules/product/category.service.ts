import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async findAll(activeOnly = false): Promise<Category[]> {
    const where: any = {};
    if (activeOnly) {
      where.isActive = true;
    }

    const categories = await this.categoryRepository.find({
      where,
      order: { sort: 'ASC', createdAt: 'ASC' },
    });

    return this.buildTree(categories);
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });

    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    return category;
  }

  async create(createDto: CreateCategoryDto): Promise<Category> {
    if (createDto.parentId) {
      const parent = await this.categoryRepository.findOne({
        where: { id: createDto.parentId },
      });
      if (!parent) {
        throw new BadRequestException('父分类不存在');
      }
    }

    const category = this.categoryRepository.create({
      ...createDto,
      isActive: createDto.isActive ?? true,
    });

    return this.categoryRepository.save(category);
  }

  async update(id: string, updateDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);

    if (updateDto.parentId && updateDto.parentId !== category.parentId) {
      if (updateDto.parentId === id) {
        throw new BadRequestException('不能将自己设为父分类');
      }

      const parent = await this.categoryRepository.findOne({
        where: { id: updateDto.parentId },
      });
      if (!parent) {
        throw new BadRequestException('父分类不存在');
      }

      const childrenIds = await this.getDescendantIds(id);
      if (childrenIds.includes(updateDto.parentId)) {
        throw new BadRequestException('不能将子分类设为父分类');
      }
    }

    Object.assign(category, updateDto);
    return this.categoryRepository.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);

    const childrenCount = await this.categoryRepository.count({
      where: { parentId: id },
    });
    if (childrenCount > 0) {
      throw new BadRequestException('存在子分类，无法删除');
    }

    await this.categoryRepository.remove(category);
  }

  async toggleActive(id: string): Promise<Category> {
    const category = await this.findOne(id);
    category.isActive = !category.isActive;
    return this.categoryRepository.save(category);
  }

  private buildTree(categories: Category[]): Category[] {
    const map = new Map<string, Category>();
    const roots: Category[] = [];

    categories.forEach((cat) => {
      map.set(cat.id, { ...cat, children: [] });
    });

    categories.forEach((cat) => {
      const node = map.get(cat.id)!;
      if (cat.parentId) {
        const parent = map.get(cat.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(node);
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  private async getDescendantIds(id: string): Promise<string[]> {
    const ids: string[] = [];
    const children = await this.categoryRepository.find({
      where: { parentId: id },
    });

    for (const child of children) {
      ids.push(child.id);
      const childIds = await this.getDescendantIds(child.id);
      ids.push(...childIds);
    }

    return ids;
  }
}
