import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Card, Descriptions, Button, Typography, Spin, message, Radio, Space, Tag } from 'antd';
import { AlipayCircleOutlined, CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Order } from '@/types';
import { orderApi } from '@/api/order';
import { ORDER_STATUS_MAP } from '@/utils/constants';
import dayjs from 'dayjs';

const { Content } = Layout;
const { Title, Text } = Typography;

export const Payment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('alipay');

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

  const handlePayment = async (success: boolean) => {
    if (!order) return;
    setPaying(true);
    try {
      await orderApi.mockPay(order.id, success);
      if (success) {
        message.success('支付成功！');
        navigate(`/orders/${order.id}`);
      } else {
        message.error('支付失败，请重试');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setPaying(false);
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

  if (order.status !== 'PENDING') {
    return (
      <Content style={{ background: '#f5f5f5' }}>
        <div className="page-container">
          <div className="content-wrapper">
            <Card style={{ textAlign: 'center', padding: 60 }}>
              <InfoCircleOutlined style={{ fontSize: 48, color: '#faad14', marginBottom: 16 }} />
              <Title level={4}>该订单已{ORDER_STATUS_MAP[order.status]?.label}</Title>
              <Space>
                <Button onClick={() => navigate('/orders')}>返回订单列表</Button>
                <Button type="primary" onClick={() => navigate(`/orders/${order.id}`)}>
                  查看订单详情
                </Button>
              </Space>
            </Card>
          </div>
        </div>
      </Content>
    );
  }

  return (
    <Content style={{ background: '#f5f5f5' }}>
      <div className="page-container">
        <div className="content-wrapper" style={{ maxWidth: 800 }}>
          <Card
            title={
              <Space>
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                <span>确认订单并支付</span>
              </Space>
            }
          >
            <Card size="small" style={{ background: '#fff7e6', borderColor: '#ffd591', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text type="secondary">应付金额：</Text>
                  <Text strong style={{ color: '#ff4d4f', fontSize: 32 }}>
                    ¥{order.finalAmount.toFixed(2)}
                  </Text>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Text type="secondary">订单号：</Text>
                  <Text copyable>{order.orderNo}</Text>
                </div>
              </div>
            </Card>

            <Card size="small" title="收货信息" style={{ marginBottom: 20 }}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="收货人">
                  {order.shippingName} {order.shippingPhone}
                </Descriptions.Item>
                <Descriptions.Item label="收货地址">{order.shippingAddress}</Descriptions.Item>
              </Descriptions>
            </Card>

            <Card size="small" title="支付方式" style={{ marginBottom: 20 }}>
              <Radio.Group
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Radio value="alipay" style={{ padding: 12, border: '1px solid #e8e8e8', borderRadius: 4, marginRight: 0 }}>
                    <Space>
                      <AlipayCircleOutlined style={{ fontSize: 24, color: '#1677ff' }} />
                      <span style={{ fontWeight: 'bold' }}>支付宝</span>
                      <Tag color="blue">推荐</Tag>
                    </Space>
                  </Radio>
                  <Radio value="wechat" style={{ padding: 12, border: '1px solid #e8e8e8', borderRadius: 4, marginRight: 0 }}>
                    <Space>
                      <span style={{ fontSize: 24, color: '#07c160' }}>💚</span>
                      <span style={{ fontWeight: 'bold' }}>微信支付</span>
                    </Space>
                  </Radio>
                </Space>
              </Radio.Group>
            </Card>

            <Card size="small" title="模拟支付说明" type="inner" style={{ marginBottom: 20, background: '#f6ffed', borderColor: '#b7eb8f' }}>
              <Text type="secondary">
                本项目使用模拟支付接口进行演示。点击下方按钮可模拟支付成功或失败场景。
              </Text>
            </Card>

            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Space size={16}>
                <Button
                  size="large"
                  onClick={() => navigate('/orders')}
                >
                  稍后支付
                </Button>
                <Button
                  size="large"
                  danger
                  onClick={() => handlePayment(false)}
                  loading={paying}
                >
                  模拟支付失败
                </Button>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => handlePayment(true)}
                  loading={paying}
                  style={{ background: '#ff4d4f', borderColor: '#ff4d4f', minWidth: 160 }}
                >
                  模拟支付成功
                </Button>
              </Space>
            </div>
          </Card>
        </div>
      </div>
    </Content>
  );
};
