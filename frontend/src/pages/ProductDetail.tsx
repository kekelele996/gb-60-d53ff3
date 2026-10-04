import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Row, Col, Card, Image, Rate, Button, InputNumber, Tabs, List, Avatar, Tag, Typography, Descriptions, Space, Spin, message } from 'antd';
import { ShoppingCartOutlined, ShopOutlined, TruckOutlined } from '@ant-design/icons';
import { Product, Review, UserCoupon } from '@/types';
import { productApi } from '@/api/product';
import { cartApi } from '@/api/cart';
import { reviewApi } from '@/api/review';
import { promotionApi } from '@/api/promotion';
import { useUserStore } from '@/stores/userStore';
import { useCartStore } from '@/stores/cartStore';
import dayjs from 'dayjs';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();
  const { fetchCart } = useCartStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [coupons, setCoupons] = useState<UserCoupon[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [activeTab, setActiveTab] = useState('detail');

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchReviews();
    }
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await productApi.getProductDetail(id!);
      setProduct(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await reviewApi.getProductReviews(id!, 1, 10);
      setReviews(res.data?.items || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    setBuying(true);
    try {
      await cartApi.addToCart({ productId: id!, quantity });
      await fetchCart();
      message.success('已加入购物车');
    } catch (error) {
      console.error(error);
    } finally {
      setBuying(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    setBuying(true);
    try {
      await cartApi.addToCart({ productId: id!, quantity });
      await fetchCart();
      navigate('/cart');
    } catch (error) {
      console.error(error);
    } finally {
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ padding: 100, textAlign: 'center' }}>
        <Text type="secondary">商品不存在</Text>
      </div>
    );
  }

  return (
    <Content style={{ background: '#f5f5f5' }}>
      <div className="page-container">
        <div className="content-wrapper">
          <Card style={{ marginBottom: 20 }}>
            <Row gutter={[32, 32]}>
              <Col xs={24} md={10}>
                <Image.PreviewGroup>
                  <Image
                    width="100%"
                    src={product.images?.[0] || 'https://placehold.co/400x400/e8f5e0/52c41a?text=No+Image'}
                    style={{ borderRadius: 8 }}
                  />
                </Image.PreviewGroup>
              </Col>
              <Col xs={24} md={14}>
                <Title level={3} style={{ marginBottom: 12 }}>{product.name}</Title>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                  <Rate disabled value={product.rating} />
                  <Text type="secondary">{product.reviewCount} 条评价</Text>
                  <Text type="secondary">销量 {product.sales}</Text>
                </div>

                <Card
                  style={{ background: '#fff7e6', borderColor: '#ffd591', marginBottom: 20 }}
                  bodyStyle={{ padding: 16 }}
                >
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <Text type="secondary">价格：</Text>
                    <Text style={{ color: '#ff4d4f', fontSize: 28, fontWeight: 'bold' }}>
                      ¥{product.price.toFixed(2)}
                    </Text>
                    {product.originalPrice && (
                      <Text delete type="secondary" style={{ marginLeft: 8 }}>
                        ¥{product.originalPrice.toFixed(2)}
                      </Text>
                    )}
                  </div>
                </Card>

                <Descriptions column={1} size="small" style={{ marginBottom: 20 }}>
                  <Descriptions.Item label="运费">
                    {product.isFreeShipping ? '包邮' : '满99元包邮'}
                  </Descriptions.Item>
                  <Descriptions.Item label="发货地">{product.origin || '默认发货地'}</Descriptions.Item>
                  <Descriptions.Item label="库存">{product.stock} 件</Descriptions.Item>
                  {product.category && (
                    <Descriptions.Item label="分类">{product.category.name}</Descriptions.Item>
                  )}
                </Descriptions>

                <Space style={{ marginBottom: 20 }}>
                  <Text>数量：</Text>
                  <InputNumber
                    min={1}
                    max={product.stock}
                    value={quantity}
                    onChange={(value) => setQuantity(value || 1)}
                    style={{ width: 100 }}
                  />
                </Space>

                <Space size={16}>
                  <Button
                    type="default"
                    size="large"
                    icon={<ShoppingCartOutlined />}
                    loading={buying}
                    onClick={handleAddToCart}
                    style={{ width: 160 }}
                  >
                    加入购物车
                  </Button>
                  <Button
                    type="primary"
                    size="large"
                    loading={buying}
                    onClick={handleBuyNow}
                    style={{ width: 160, background: '#ff4d4f', borderColor: '#ff4d4f' }}
                  >
                    立即购买
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          <Card>
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane tab="商品详情" key="detail">
                <Paragraph>
                  <Title level={4}>商品描述</Title>
                  {product.description}
                </Paragraph>
              </TabPane>
              <TabPane tab={`用户评价 (${product.reviewCount})`} key="reviews">
                {reviews.length > 0 ? (
                  <List
                    dataSource={reviews}
                    renderItem={(review) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar icon={<ShopOutlined />} />}
                          title={
                            <Space>
                              <span>{review.user?.username || '匿名用户'}</span>
                              <Rate disabled value={review.rating} style={{ fontSize: 12 }} />
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {dayjs(review.createdAt).format('YYYY-MM-DD HH:mm')}
                              </Text>
                            </Space>
                          }
                          description={
                            <div>
                              <p style={{ color: '#333' }}>{review.content}</p>
                              {review.reply && (
                                <Card size="small" style={{ background: '#f5f5f5', marginTop: 8 }}>
                                  <Text type="secondary">商家回复：</Text>
                                  <p style={{ margin: 0 }}>{review.reply}</p>
                                </Card>
                              )}
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: 40 }}>
                    <Text type="secondary">暂无评价</Text>
                  </div>
                )}
              </TabPane>
            </Tabs>
          </Card>
        </div>
      </div>
    </Content>
  );
};
