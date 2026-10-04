import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Carousel, Card, Space, Typography, Button, Tag } from 'antd';
import { RightOutlined, GiftOutlined, TruckOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Product, Category, Coupon } from '@/types';
import { productApi } from '@/api/product';
import { promotionApi } from '@/api/promotion';
import { ProductCard } from '@/components/ProductCard';

const { Content } = Layout;
const { Title, Text } = Typography;

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [hotProducts, setHotProducts] = useState<Product[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catRes, hotRes, recRes, couponRes] = await Promise.all([
          productApi.getCategoryTree(),
          productApi.getHotProducts(8),
          productApi.getRecommendedProducts(8),
          promotionApi.getActiveCoupons(),
        ]);
        setCategories(catRes.data || []);
        setHotProducts(hotRes.data || []);
        setRecommendedProducts(recRes.data || []);
        setCoupons(couponRes.data || []);
      } catch (error) {
        console.error('加载首页数据失败', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const carouselImages = [
    'https://placehold.co/1200x400/52c41a/fff?text=Spring+Flower+Sale',
    'https://placehold.co/1200x400/722ed1/fff?text=New+Arrivals',
    'https://placehold.co/1200x400/fa8c16/fff?text=Free+Shipping',
  ];

  return (
    <Content style={{ background: '#f5f5f5' }}>
      <div className="page-container">
        <div className="content-wrapper">
          {/* 轮播图 */}
          <Card style={{ marginBottom: 20, borderRadius: 8 }}>
            <Carousel autoplay dotPosition="bottom">
              {carouselImages.map((img, idx) => (
                <div key={idx}>
                  <img
                    src={img}
                    alt={`banner-${idx}`}
                    style={{ width: '100%', height: 300, objectFit: 'cover', borderRadius: 8 }}
                  />
                </div>
              ))}
            </Carousel>
          </Card>

          {/* 优惠券 */}
          {coupons.length > 0 && (
            <Card title={<><GiftOutlined /> 优惠券专区</>} style={{ marginBottom: 20 }}>
              <Row gutter={[16, 16]}>
                {coupons.slice(0, 4).map((coupon) => (
                  <Col xs={24} sm={12} md={6} key={coupon.id}>
                    <Card
                      size="small"
                      style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff' }}
                    >
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 24, fontWeight: 'bold' }}>
                          {coupon.type === 'FIXED' ? `¥${coupon.value}` : `${coupon.value * 10}折`}
                        </div>
                        <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                          满{coupon.minOrderAmount}元可用
                        </Text>
                        <div style={{ marginTop: 8 }}>
                          <Button
                            size="small"
                            type="primary"
                            onClick={() => navigate('/products')}
                            style={{ background: '#fff', color: '#764ba2', borderColor: '#fff' }}
                          >
                            去使用
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          )}

          {/* 商品分类 */}
          <Card
            title={
              <Space>
                <span>商品分类</span>
                <Button type="link" icon={<RightOutlined />} onClick={() => navigate('/products')}>
                  查看全部
                </Button>
              </Space>
            }
            style={{ marginBottom: 20 }}
          >
            <Row gutter={[16, 16]}>
              {categories.slice(0, 8).map((cat) => (
                <Col xs={12} sm={6} md={4} lg={3} key={cat.id}>
                  <Card
                    hoverable
                    size="small"
                    style={{ textAlign: 'center', cursor: 'pointer' }}
                    onClick={() => navigate(`/products?categoryId=${cat.id}`)}
                    className="card-hover"
                  >
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🌸</div>
                    <div style={{ fontWeight: 500 }}>{cat.name}</div>
                    {cat.children && cat.children.length > 0 && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {cat.children.length}个子分类
                      </Text>
                    )}
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>

          {/* 热销商品 */}
          <Card
            title={
              <Space>
                <span>🔥 热销商品</span>
                <Button type="link" icon={<RightOutlined />} onClick={() => navigate('/products?sortBy=sales&sortOrder=DESC')}>
                  查看更多
                </Button>
              </Space>
            }
            style={{ marginBottom: 20 }}
          >
            <Row gutter={[16, 16]}>
              {hotProducts.map((product) => (
                <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                  <ProductCard product={product} />
                </Col>
              ))}
            </Row>
          </Card>

          {/* 推荐商品 */}
          <Card
            title={
              <Space>
                <span>💐 为您推荐</span>
                <Button type="link" icon={<RightOutlined />} onClick={() => navigate('/products')}>
                  查看更多
                </Button>
              </Space>
            }
          >
            <Row gutter={[16, 16]}>
              {recommendedProducts.map((product) => (
                <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                  <ProductCard product={product} />
                </Col>
              ))}
            </Row>
          </Card>

          {/* 服务保障 */}
          <Card style={{ marginTop: 20, background: '#fff' }}>
            <Row gutter={[16, 16]} justify="center">
              <Col xs={24} sm={6} style={{ textAlign: 'center' }}>
                <Space>
                  <TruckOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                  <div>
                    <div style={{ fontWeight: 'bold' }}>全国包邮</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>满99元免运费</Text>
                  </div>
                </Space>
              </Col>
              <Col xs={24} sm={6} style={{ textAlign: 'center' }}>
                <Space>
                  <Tag color="green" style={{ fontSize: 24, padding: '4px 12px' }}>✓</Tag>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>品质保证</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>精选优质花卉</Text>
                  </div>
                </Space>
              </Col>
              <Col xs={24} sm={6} style={{ textAlign: 'center' }}>
                <Space>
                  <Tag color="blue" style={{ fontSize: 24, padding: '4px 12px' }}>↺</Tag>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>7天退换</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>无理由退换货</Text>
                  </div>
                </Space>
              </Col>
              <Col xs={24} sm={6} style={{ textAlign: 'center' }}>
                <Space>
                  <Tag color="orange" style={{ fontSize: 24, padding: '4px 12px' }}>★</Tag>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>专业客服</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>7x24小时服务</Text>
                  </div>
                </Space>
              </Col>
            </Row>
          </Card>
        </div>
      </div>
    </Content>
  );
};
