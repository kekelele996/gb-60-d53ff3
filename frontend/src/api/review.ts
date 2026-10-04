import request from '@/utils/request';
import { Review, PaginatedResponse } from '@/types';

export interface CreateReviewData {
  orderId: string;
  productId: string;
  rating: number;
  content: string;
  images?: string[];
}

export const reviewApi = {
  createReview: (data: CreateReviewData) => request.post<Review>('/reviews', data),
  getProductReviews: (productId: string, page?: number, pageSize?: number) => 
    request.get<PaginatedResponse<Review>>(`/reviews/product/${productId}`, { params: { page, pageSize } }),
  getMyReviews: (page?: number, pageSize?: number) => 
    request.get<PaginatedResponse<Review>>('/reviews/my', { params: { page, pageSize } }),
  getPendingReviews: () => request.get<Review[]>('/reviews/pending'),
  replyReview: (id: string, reply: string) => request.post(`/reviews/${id}/reply`, { reply }),
};
