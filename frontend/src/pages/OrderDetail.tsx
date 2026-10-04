import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Card, Descriptions, Image, Button, Tag, Typography, Spin, message, Modal, Table, Space } from 'antd';
import { EyeOutlined, PayCircleOutlined } from '@ant-design/icons';
import { Order } from '@/types';
import { orderApi } from '@/api/order';
import { ORDER_STATUS_MAP } from '@/utils/constants';
import dayjs from 'dayjs';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Column } = Table;

export const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

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

  const handleCancel = () => {
    if (!order) return;
    Modal.confirm({
      title: '确认取消订单？',
      content: '订单取消后将无法恢复，是否继续？',
      okText: '确认取消',
      okType: 'danger',
      onOk: async () => {
        try {
          await orderApi.cancelOrder(order.id);
          message.success('订单已取消');
          fetchOrder();
        } catch (error) {
          console.error(error);
        }
      },
    });
  };

  const handleConfirm = () => {
    if (!order) return;
    Modal.confirm({
      title: '确认收货？',
      okText: '确认收货',
      onOk: async () => {
        try {
          await orderApi.confirmOrder(order.id);
          message.success('已确认收货');
          fetchOrder();
        } catch (error) {
          console.error(error);
        }
      },
    });
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

  const status = ORDER_STATUS_MAP[order.status] || { label: order.status, color: 'default' };

  return (
    <Content style={{ background: '#f5f5f5' }}>
      <div className="page-container">
        <div className="content-wrapper">
          <Card
            title={
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Space>
                  <span>订单详情</span>
                  <Tag color={status.color}>{status.label}</Tag>
                </Space>
                <Space>
                  {order.status === 'PENDING' && (
                    <>
                      <Button danger onClick={handleCancel}>取消订单</Button>
                      <Button
                        type="primary"
                        icon={<PayCircleOutlined />}
                        onClick={() => navigate(`/orders/${order.id}/pay`)}
                        style={{ background: '#ff4d4f', borderColor: '#ff4d4f' }}
                      >
                        去支付
                      </Button>
                    </>
                  )}
                  {order.status === 'SHIPPED' && (
                    <>
                      <Button type="link" onClick={() => navigate(`/orders/${order.id}/shipping`)}>
                        查看物流
                      </Button>
                      <Button type="primary" onClick={handleConfirm}>确认收货</Button>
                    </>
                  )}
                  {order.status === 'COMPLETED' && (
                    <Button type="primary" onClick={() => navigate(`/orders/${order.id}/review`)}>
                      去评价
                    </Button>
                  )}
                </Space>
              </Space>
            }
          >
            <Descriptions column={2} bordered style={{ marginBottom: 20 }}>
              <Descriptions.Item label="订单号">{order.orderNo}</Descriptions.Item>
              <Descriptions.Item label="下单时间">
                {dayjs(order.createdAt).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="收货人">{order.shippingName}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{order.shippingPhone}</Descriptions.Item>
              <Descriptions.Item label="收货地址" span={2}>
                {order.shippingAddress}
              </Descriptions.Item>
              {order.remark && (
                <Descriptions.Item label="订单备注" span={2}>
                  {order.remark}
                </Descriptions.Item>
              )}
            </Descriptions>

            <Card title="商品信息" style={{ marginBottom: 20 }}>
              <Table
                rowKey="id"
                dataSource={order.orderItems || []}
                pagination={false}
              >
                <Column
                  title="商品信息"
                  dataIndex="product"
                  render={(product, record) =>
                    product ? (
                      <Space>
                        <Image
                          width={80}
                          height={80}
                          src={product.images?.[0] || 'https://placehold.co/80x80'}
                          style={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/products/${product.id}`)}
                        />
                        <div>
                          <Text
                            style={{ cursor: 'pointer', display: 'block' }}
                            onClick={() => navigate(`/products/${product.id}`)}
                          >
                            {product.name}
                          </Text>
                        </div>
                      </Space>
                    ) : null
                  }
                />
                <Column title="单价" dataIndex="price" render={(v) => `¥${v.toFixed(2)}`} />
                <Column title="数量" dataIndex="quantity" />
                <Column
                  title="小计"
                  dataIndex="totalPrice"
                  render={(v) => <Text strong>¥{v.toFixed(2)}</Text>}
                />
              </Table>
            </Card>

            <Card title="订单金额">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="商品总价">
                  ¥{order.totalAmount.toFixed(2)}
                </Descriptions.Item>
                <Descriptions.Item label="优惠金额">
                  <Text style={{ color: '#ff4d4f' }}>-¥{order.discountAmount.toFixed(2)}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="运费">
                  {order.shippingFee > 0 ? `¥${order.shippingFee.toFixed(2)}` : '包邮'}
                </Descriptions.Item>
                <Descriptions.Item label="实付金额">
                  <Text strong style={{ color: '#ff4d4f', fontSize: 18 }}>
                    ¥{order.finalAmount.toFixed(2)}
                  </Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Card>
        </div>
      </div>
    </Content>
  );
};
