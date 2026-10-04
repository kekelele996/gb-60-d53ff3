import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { Product } from '../product/entities/product.entity';
import { AddCartDto, UpdateCartDto } from './dto/order.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async findByUser(userId: string) {
    const carts = await this.cartRepository.find({
      where: { userId },
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });

    let totalAmount = 0;
    let selectedCount = 0;

    carts.forEach((item) => {
      if (item.selected && item.product) {
        totalAmount += item.product.price * item.quantity;
        selectedCount += item.quantity;
      }
    });

    return {
      list: carts,
      totalAmount: Number(totalAmount.toFixed(2)),
      selectedCount,
      totalCount: carts.reduce((sum, item) => sum + item.quantity, 0),
    };
  }

  async add(userId: string, addDto: AddCartDto) {
    const { productId, quantity } = addDto;

    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('商品不存在');
    }

    if (product.stock < quantity) {
      throw new BadRequestException('库存不足');
    }

    let cartItem = await this.cartRepository.findOne({
      where: { userId, productId },
    });

    if (cartItem) {
      const newQuantity = cartItem.quantity + quantity;
      if (product.stock < newQuantity) {
        throw new BadRequestException('库存不足');
      }
      cartItem.quantity = newQuantity;
    } else {
      cartItem = this.cartRepository.create({
        userId,
        productId,
        quantity,
      });
    }

    await this.cartRepository.save(cartItem);
    return this.findByUser(userId);
  }

  async update(userId: string, id: string, updateDto: UpdateCartDto) {
    const cartItem = await this.cartRepository.findOne({
      where: { id, userId },
      relations: ['product'],
    });

    if (!cartItem) {
      throw new NotFoundException('购物车项不存在');
    }

    if (updateDto.quantity !== undefined) {
      if (cartItem.product && cartItem.product.stock < updateDto.quantity) {
        throw new BadRequestException('库存不足');
      }
      cartItem.quantity = updateDto.quantity;
    }

    if (updateDto.selected !== undefined) {
      cartItem.selected = updateDto.selected;
    }

    await this.cartRepository.save(cartItem);
    return this.findByUser(userId);
  }

  async remove(userId: string, ids: string | string[]) {
    const idList = Array.isArray(ids) ? ids : [ids];

    await this.cartRepository.delete({
      userId,
      id: In(idList),
    });

    return this.findByUser(userId);
  }

  async clear(userId: string) {
    await this.cartRepository.delete({ userId });
    return { message: '购物车已清空' };
  }

  async clearSelected(userId: string) {
    await this.cartRepository.delete({ userId, selected: true });
    return { message: '已清除已选中商品' };
  }

  async selectAll(userId: string, selected: boolean) {
    await this.cartRepository.update({ userId }, { selected });
    return this.findByUser(userId);
  }

  async getSelectedItems(userId: string) {
    const carts = await this.cartRepository.find({
      where: { userId, selected: true },
      relations: ['product'],
    });

    const items = carts.filter((item) => item.product);

    let subtotal = 0;
    items.forEach((item) => {
      subtotal += item.product.price * item.quantity;
    });

    return {
      items,
      subtotal: Number(subtotal.toFixed(2)),
      totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
    };
  }
}
