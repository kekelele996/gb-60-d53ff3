import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Card, Steps, Typography, Space, Spin, Button, Tag } from 'antd';
import { TruckOutlined, HomeOutlined, InboxOutlined } from '@ant-design/icons';
import type { Shipping as ShippingInfo, Order } from '@/types';
import { orderApi } from '@/api/order';
import { SHIPPING_STATUS_MAP, ORDER_STATUS_MAP } from '@/utils/constants';
import dayjs from 'dayjs';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Step } = Steps;

export const Shipping: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [shipping, setShipping] = useState<ShippingInfo | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [orderRes, shippingRes] = await Promise.all([
        orderApi.getOrderDetail(id!),
        orderApi.getShipping(id!),
      ]);
      setOrder(orderRes.data);
      setShipping(shippingRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  const orderStatus = ORDER_STATUS_MAP[order?.status || ''] || { label: '', color: 'default' };

  const steps = [
    {
      title: '待发货',
      icon: <InboxOutlined />,
      status: 'PENDING',
    },
    {
      title: '已发货',
      icon: <InboxOutlined />,
      status: 'SHIPPED',
    },
    {
      title: '运输中',
      icon: <TruckOutlined />,
      status: 'TRANSIT',
    },
    {
      title: '已送达',
      icon: <HomeOutlined />,
      status: 'DELIVERED',
    },
  ];

  const currentStepIndex = steps.findIndex((s) => s.status === shipping?.status) ?? 0;

  return (
    <Content style={{ background: '#f5f5f5' }}>
      <div className="page-container">
        <div className="content-wrapper" style={{ maxWidth: 800 }}>
          <Card
            title={
              <Space>
                <InboxOutlined />
                <span>物流信息</span>
              </Space>
            }
            extra={
              <Button onClick={() => navigate(`/orders/${id}`)}>
                返回订单
              </Button>
            }
          >
            <Card size="small" style={{ marginBottom: 20, background: '#f6ffed', borderColor: '#b7eb8f' }}>
              <Space size={24}>
                <Space>
                  <Text type="secondary">订单状态：</Text>
                  <Tag color={orderStatus.color}>{orderStatus.label}</Tag>
                </Space>
                <Space>
                  <Text type="secondary">物流状态：</Text>
                  <Tag color={shipping ? SHIPPING_STATUS_MAP[shipping.status]?.color || 'default' : 'default'}>
                    {shipping ? SHIPPING_STATUS_MAP[shipping?.status || '']?.label || '' : '暂无'}
                  </Tag>
                </Space>
                {shipping?.trackingNo && (
                  <Space>
                    <Text type="secondary">运单号：</Text>
                    <Text copyable>{shipping.trackingNo}</Text>
                  </Space>
                )}
                {shipping?.company && (
                  <Space>
                    <Text type="secondary">物流公司：</Text>
                    <Text>{shipping.company}</Text>
                  </Space>
                )}
              </Space>
            </Card>

            <Card size="small" title="物流进度">
              {shipping && shipping.tracks && shipping.tracks.length > 0 ? (
                <Steps
                  direction="vertical"
                  current={currentStepIndex}
                  progressDot
                >
                  {shipping.tracks.slice().reverse().map((track, index) => (
                    <Step
                      key={index}
                      title={track.description}
                      description={dayjs(track.time).format('YYYY-MM-DD HH:mm')}
                      status={index === 0 ? 'process' : 'finish'}
                    />
                  ))}
                </Steps>
              ) : (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <InboxOutlined style={{ fontSize: 48, color: '#999', marginBottom: 16 }} />
                  <Text type="secondary">暂无物流信息</Text>
                </div>
              )}
            </Card>
          </Card>
        </div>
      </div>
    </Content>
  );
};
