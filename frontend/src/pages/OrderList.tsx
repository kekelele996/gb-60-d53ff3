import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Card, Tabs, Table, Image, Button, Tag, Typography, Empty, Pagination, Space, message, Modal } from 'antd';
import { ShoppingCartOutlined, EyeOutlined, PayCircleOutlined } from '@ant-design/icons';
import { Order, OrderStatus } from '@/types';
import { orderApi, OrderQuery } from '@/api/order';
import { ORDER_STATUS_MAP } from '@/utils/constants';
import dayjs from 'dayjs';

const { Content } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Column } = Table;

export const OrderList: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 });

  useEffect(() => {
    fetchOrders();
  }, [activeTab, pagination.page]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params: OrderQuery = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        status: activeTab === 'all' ? undefined : (activeTab as OrderStatus),
      };
      const res = await orderApi.getOrderList(params);
      setOrders(res.data?.items || []);
      setPagination((prev) => ({ ...prev, total: res.data?.total || 0 }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (order: Order) => {
    Modal.confirm({
      title: '确认取消订单？',
      content: '订单取消后将无法恢复，是否继续？',
      okText: '确认取消',
      okType: 'danger',
      cancelText: '再想想',
      onOk: async () => {
        try {
          await orderApi.cancelOrder(order.id);
          message.success('订单已取消');
          fetchOrders();
        } catch (error) {
          console.error(error);
        }
      },
    });
  };

  const handleConfirm = (order: Order) => {
    Modal.confirm({
      title: '确认收货？',
      content: '确认收货后订单将完成，是否继续？',
      okText: '确认收货',
      onOk: async () => {
        try {
          await orderApi.confirmOrder(order.id);
          message.success('已确认收货');
          fetchOrders();
        } catch (error) {
          console.error(error);
        }
      },
    });
  };

  const tabList = [
    { key: 'all', label: '全部订单' },
    { key: 'PENDING', label: '待付款' },
    { key: 'PAID', label: '待发货' },
    { key: 'SHIPPED', label: '待收货' },
    { key: 'COMPLETED', label: '已完成' },
    { key: 'CANCELLED', label: '已取消' },
  ];

  const renderActions = (record: Order) => {
    const actions = [];
    actions.push(
      <Button type="link" icon={<EyeOutlined />} onClick={() => navigate(`/orders/${record.id}`)}>
        查看详情
      </Button>
    );
    if (record.status === 'PENDING') {
      actions.push(
        <Button
          type="primary"
          icon={<PayCircleOutlined />}
          onClick={() => navigate(`/orders/${record.id}/pay`)}
        >
          去支付
        </Button>
      );
      actions.push(
        <Button danger type="link" onClick={() => handleCancel(record)}>
          取消订单
        </Button>
      );
    }
    if (record.status === 'SHIPPED') {
      actions.push(
        <Button type="link" onClick={() => navigate(`/orders/${record.id}/shipping`)}>
          查看物流
        </Button>
      );
      actions.push(
        <Button type="primary" onClick={() => handleConfirm(record)}>
          确认收货
        </Button>
      );
    }
    if (record.status === 'COMPLETED') {
      actions.push(
        <Button type="link" onClick={() => navigate(`/orders/${record.id}/review`)}>
          去评价
        </Button>
      );
    }
    return <Space>{actions}</Space>;
  };

  return (
    <Content style={{ background: '#f5f5f5' }}>
      <div className="page-container">
        <div className="content-wrapper">
          <Card
            title={
              <Space>
                <ShoppingCartOutlined />
                <span>我的订单</span>
              </Space>
            }
          >
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              {tabList.map((tab) => (
                <TabPane tab={tab.label} key={tab.key}>
                  {orders.length > 0 ? (
                    <Table
                      rowKey="id"
                      dataSource={orders}
                      pagination={false}
                      loading={loading}
                      expandable={{
                        expandedRowRender: (record) => (
                          <Table
                            rowKey="id"
                            dataSource={record.orderItems || []}
                            pagination={false}
                            showHeader={false}
                          >
                            <Column
                              dataIndex="product"
                              render={(product) =>
                                product ? (
                                  <Space>
                                    <Image
                                      width={60}
                                      height={60}
                                      src={product.images?.[0] || 'https://placehold.co/60x60'}
                                      style={{ cursor: 'pointer' }}
                                      onClick={() => navigate(`/products/${product.id}`)}
                                    />
                                    <Text
                                      style={{ cursor: 'pointer' }}
                                      onClick={() => navigate(`/products/${product.id}`)}
                                    >
                                      {product.name}
                                    </Text>
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
                        ),
                      }}
                    >
                      <Column
                        title="订单号"
                        dataIndex="orderNo"
                        render={(v, record) => (
                          <Space direction="vertical" size={4}>
                            <Text copyable>{v}</Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {dayjs(record.createdAt).format('YYYY-MM-DD HH:mm')}
                            </Text>
                          </Space>
                        )}
                      />
                      <Column
                        title="订单状态"
                        dataIndex="status"
                        render={(v) => {
                          const status = ORDER_STATUS_MAP[v] || { label: v, color: 'default' };
                          return <Tag color={status.color}>{status.label}</Tag>;
                        }}
                      />
                      <Column
                        title="订单金额"
                        dataIndex="finalAmount"
                        render={(v) => <Text strong style={{ color: '#ff4d4f' }}>¥{v.toFixed(2)}</Text>}
                      />
                      <Column title="操作" key="action" render={(_, record) => renderActions(record as Order)} />
                    </Table>
                  ) : (
                    <Empty description="暂无订单" style={{ padding: 60 }}>
                      <Button type="primary" onClick={() => navigate('/products')}>
                        去购物
                      </Button>
                    </Empty>
                  )}

                  {orders.length > 0 && (
                    <div style={{ marginTop: 20, textAlign: 'center' }}>
                      <Pagination
                        current={pagination.page}
                        pageSize={pagination.pageSize}
                        total={pagination.total}
                        showSizeChanger
                        onChange={(page, pageSize) => setPagination((prev) => ({ ...prev, page, pageSize }))}
                      />
                    </div>
                  )}
                </TabPane>
              ))}
            </Tabs>
          </Card>
        </div>
      </div>
    </Content>
  );
};
