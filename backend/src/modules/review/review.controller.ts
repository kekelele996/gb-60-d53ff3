import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../user/entities/user.entity';
import {
  CreateReviewDto,
  ReplyReviewDto,
  QueryReviewDto,
} from './dto/review.dto';

@Controller('api/reviews')
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @Get('product/:productId')
  async findByProduct(
    @Param('productId') productId: string,
    @Query() queryDto: QueryReviewDto,
  ) {
    return this.reviewService.findByProduct(productId, queryDto);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @CurrentUser() user: any,
    @Body() createDto: CreateReviewDto,
  ) {
    return this.reviewService.create(user.id, createDto);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  async findMine(
    @CurrentUser() user: any,
    @Query() queryDto: QueryReviewDto,
  ) {
    return this.reviewService.findByUser(user.id, queryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.reviewService.remove(id, user.id);
  }
}

@Controller('api/admin/reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class ReviewAdminController {
  constructor(private reviewService: ReviewService) {}

  @Get()
  async findAll(@Query() queryDto: QueryReviewDto) {
    return this.reviewService.adminFindAll(queryDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.reviewService.findOne(id);
  }

  @Patch(':id/reply')
  async reply(@Param('id') id: string, @Body() replyDto: ReplyReviewDto) {
    return this.reviewService.reply(id, replyDto);
  }

  @Patch(':id/toggle-visible')
  async toggleVisible(@Param('id') id: string) {
    return this.reviewService.toggleVisible(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.reviewService.remove(id);
  }
}
