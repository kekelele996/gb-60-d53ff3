import React from 'react';
import { Card, Image, Tag, Rate, message } from 'antd';
import { ShoppingCartOutlined, StarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Product } from '@/types';
import { useCartStore } from '@/stores/cartStore';
import { useUserStore } from '@/stores/userStore';

interface Props {
  product: Product;
}

export const ProductCard: React.FC<Props> = ({ product }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();
  const { addToCart, fetchCart } = useCartStore();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    try {
      await addToCart(product.id, 1);
      await fetchCart();
      message.success('已加入购物车');
    } catch (error) {
      console.error(error);
    }
  };

  const goToDetail = () => {
    navigate(`/products/${product.id}`);
  };

  return (
    <Card
      hoverable
      className="card-hover"
      onClick={goToDetail}
      styles={{
        body: { padding: 12 },
      }}
      actions={[
        <span key="cart" onClick={handleAddToCart}>
          <ShoppingCartOutlined /> 加入购物车
        </span>,
      ]}
    >
      <div style={{ position: 'relative' }}>
        <Image
          src={product.images?.[0] || 'https://placehold.co/300x300/e8f5e0/52c41a?text=No+Image'}
          alt={product.name}
          preview={false}
          style={{ height: 200, objectFit: 'cover', width: '100%' }}
          className="product-image"
        />
        {product.isFreeShipping && (
          <Tag color="green" style={{ position: 'absolute', top: 8, left: 8 }}>
            包邮
          </Tag>
        )}
        {product.originalPrice && (
          <Tag color="red" style={{ position: 'absolute', top: 8, right: 8 }}>
            促销
          </Tag>
        )}
      </div>
      <div style={{ marginTop: 8 }}>
        <div
          style={{
            fontWeight: 500,
            marginBottom: 4,
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2,
            overflow: 'hidden',
            height: 44,
          }}
        >
          {product.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
          <Rate disabled value={product.rating} style={{ fontSize: 12 }} />
          <span style={{ fontSize: 12, color: '#999' }}>({product.reviewCount})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#ff4d4f', fontSize: 20, fontWeight: 'bold' }}>
            ¥{product.price.toFixed(2)}
          </span>
          {product.originalPrice && (
            <span style={{ color: '#999', textDecoration: 'line-through', fontSize: 12 }}>
              ¥{product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, color: '#999', fontSize: 12 }}>
          <span>销量 {product.sales}</span>
          <span>库存 {product.stock}</span>
        </div>
      </div>
    </Card>
  );
};
