import request from '@/utils/request';
import { Product, Category, PaginatedResponse } from '@/types';

export interface ProductQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  origin?: string;
  isFreeShipping?: boolean;
  sortBy?: 'price' | 'sales' | 'rating' | 'createdAt';
  sortOrder?: 'ASC' | 'DESC';
}

export const productApi = {
  getCategories: () => request.get<Category[]>('/categories'),
  getCategoryTree: () => request.get<Category[]>('/categories/tree'),
  getProductList: (params: ProductQuery) => request.get<PaginatedResponse<Product>>('/products', { params }),
  getProductDetail: (id: string) => request.get<Product>(`/products/${id}`),
  getRecommendedProducts: (limit?: number) => request.get<Product[]>('/products/recommended', { params: { limit } }),
  getHotProducts: (limit?: number) => request.get<Product[]>('/products/hot', { params: { limit } }),
  searchProducts: (keyword: string, params?: ProductQuery) => 
    request.get<PaginatedResponse<Product>>('/products/search', { params: { keyword, ...params } }),
};
