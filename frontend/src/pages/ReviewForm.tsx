import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Card, Form, Input, Button, Rate, Image, Typography, Spin, message, Space } from 'antd';
import { StarOutlined } from '@ant-design/icons';
import { Order } from '@/types';
import { orderApi } from '@/api/order';
import { reviewApi } from '@/api/review';

const { Content } = Layout;
const { Title: AntTitle, Text } = Typography;
const { TextArea } = Input;

export const ReviewForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await orderApi.getOrderDetail(id!);
      setOrder(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    if (!order) return;
    setSubmitting(true);
    try {
      for (const item of order.orderItems || []) {
        const rating = values[`rating_${item.id}`] || 5;
        const content = values[`content_${item.id}`] || '商品很好，非常满意！';
        await reviewApi.createReview({
          orderId: order.id,
          productId: item.productId,
          rating,
          content,
        });
      }
      message.success('评价成功');
      navigate('/orders');
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: 100, textAlign: 'center' }}>
        <Text type="secondary">订单不存在</Text>
      </div>
    );
  }

  return (
    <Content style={{ background: '#f5f5f5' }}>
      <div className="page-container">
        <div className="content-wrapper" style={{ maxWidth: 800 }}>
          <Card
            title={
              <Space>
                <StarOutlined style={{ color: '#faad14' }} />
                <span>订单评价</span>
              </Space>
            }
          >
            <Form layout="vertical" onFinish={onFinish}>
              {(order.orderItems || []).map((item) => (
                <div key={item.id}>
                  <Card style={{ marginBottom: 16 }}>
                    <Space>
                      {item.product && (
                        <Image
                          width={80}
                          height={80}
                          src={item.product.images?.[0] || 'https://placehold.co/80x80'}
                          style={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/products/${item.productId}`)}
                        />
                      )}
                      <div>
                        <Text strong>{item.product?.name}</Text>
                      </div>
                    </Space>
                  </Card>

                  <Form.Item
                    name={`rating_${item.id}`}
                    label="商品评分"
                    initialValue={5}
                    rules={[{ required: true, message: '请选择评分' }]}
                  >
                    <Rate />
                  </Form.Item>

                  <Form.Item
                    name={`content_${item.id}`}
                    label="评价内容"
                    initialValue="商品很好，非常满意！"
                    rules={[{ required: true, message: '请输入评价内容' }]}
                  >
                    <TextArea rows={4} placeholder="说说您的使用体验..." />
                  </Form.Item>
                </div>
              ))}

              <Form.Item style={{ marginBottom: 0, textAlign: 'center' }}>
                <Space size={16}>
                  <Button onClick={() => navigate('/orders')}>
                    取消
                  </Button>
                  <Button type="primary" htmlType="submit" loading={submitting}>
                    提交评价
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </div>
    </Content>
  );
};
