import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Review } from './entities/review.entity';
import { Order } from '../order/entities/order.entity';
import { OrderItem } from '../order/entities/order-item.entity';
import { Product } from '../product/entities/product.entity';
import { OrderStatus } from '../order/entities/order.entity';
import {
  CreateReviewDto,
  ReplyReviewDto,
  QueryReviewDto,
} from './dto/review.dto';
import { calcPages } from '../../common/helpers/utils.helper';

@Injectable()
export class ReviewService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(userId: string, createDto: CreateReviewDto) {
    const { orderId, orderItemId, rating, content, images, isAnonymous } = createDto;

    const order = await this.orderRepository.findOne({
      where: { id: orderId, userId },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== OrderStatus.COMPLETED) {
      throw new BadRequestException('只有已完成的订单才能评价');
    }

    const orderItem = order.items.find((item) => item.id === orderItemId);
    if (!orderItem) {
      throw new NotFoundException('订单项不存在');
    }

    if (orderItem.hasReviewed) {
      throw new BadRequestException('该商品已评价');
    }

    const existingReview = await this.reviewRepository.findOne({
      where: { orderId, orderItemId, userId },
    });
    if (existingReview) {
      throw new BadRequestException('该商品已评价');
    }

    const product = await this.productRepository.findOne({
      where: { id: orderItem.productId },
    });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const review = this.reviewRepository.create({
        userId,
        productId: orderItem.productId,
        orderId,
        orderItemId,
        rating,
        content,
        images,
        isAnonymous: isAnonymous ?? false,
      });

      await queryRunner.manager.save(review);

      orderItem.hasReviewed = true;
      await queryRunner.manager.save(orderItem);

      if (product) {
        const reviewCount = await this.reviewRepository.count({
          where: { productId: product.id, isVisible: true },
        });

        const { avgRating } = await this.reviewRepository
          .createQueryBuilder('review')
          .select('AVG(review.rating)', 'avgRating')
          .where('review.productId = :productId', { productId: product.id })
          .andWhere('review.isVisible = true')
          .getRawOne();

        product.reviewCount = reviewCount + 1;
        product.avgRating = Number(avgRating || rating);
        await queryRunner.manager.save(product);
      }

      await queryRunner.commitTransaction();
      return this.findOne(review.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findOne(id: string) {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['user', 'product', 'order'],
    });

    if (!review) {
      throw new NotFoundException('评价不存在');
    }

    return review;
  }

  async findByProduct(productId: string, queryDto: QueryReviewDto) {
    const { rating, page = 1, pageSize = 10 } = queryDto;

    const where: any = { productId, isVisible: true };
    if (rating) {
      where.rating = rating;
    }

    const [reviews, total] = await this.reviewRepository.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });

    const summary = await this.getSummary(productId);

    return {
      list: reviews,
      total,
      page,
      pageSize,
      pages: calcPages(total, pageSize),
      summary,
    };
  }

  async findByUser(userId: string, queryDto: QueryReviewDto) {
    const { page = 1, pageSize = 10 } = queryDto;

    const [reviews, total] = await this.reviewRepository.findAndCount({
      where: { userId },
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
      relations: ['product', 'order'],
    });

    return {
      list: reviews,
      total,
      page,
      pageSize,
      pages: calcPages(total, pageSize),
    };
  }

  async reply(id: string, replyDto: ReplyReviewDto) {
    const review = await this.findOne(id);

    review.adminReply = replyDto.reply;
    review.adminRepliedAt = new Date();

    return this.reviewRepository.save(review);
  }

  async toggleVisible(id: string) {
    const review = await this.findOne(id);
    review.isVisible = !review.isVisible;
    return this.reviewRepository.save(review);
  }

  async remove(id: string, userId?: string) {
    const review = await this.findOne(id);

    if (userId && review.userId !== userId) {
      throw new ForbiddenException('无权删除此评价');
    }

    await this.reviewRepository.remove(review);
    return { message: '删除成功' };
  }

  private async getSummary(productId: string) {
    const reviews = await this.reviewRepository.find({
      where: { productId, isVisible: true },
      select: ['rating'],
    });

    const total = reviews.length;
    if (total === 0) {
      return { total, avgRating: 0, distribution: [] };
    }

    const distribution = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: reviews.filter((r) => r.rating === star).length,
    }));

    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / total;

    return {
      total,
      avgRating: Number(avgRating.toFixed(2)),
      distribution,
    };
  }

  async adminFindAll(queryDto: QueryReviewDto) {
    const { page = 1, pageSize = 10 } = queryDto;

    const [reviews, total] = await this.reviewRepository.findAndCount({
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
      relations: ['user', 'product', 'order'],
    });

    return {
      list: reviews,
      total,
      page,
      pageSize,
      pages: calcPages(total, pageSize),
    };
  }
}
