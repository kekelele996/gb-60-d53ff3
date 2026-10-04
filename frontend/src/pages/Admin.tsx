import React, { useState, useEffect } from 'react';
import { Layout, Menu, Card, Typography, Statistic, Row, Col, Table, Tag, Button, Space, Spin, Modal, message, Select, Input, Form } from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  ProfileOutlined,
  TeamOutlined,
  ShopOutlined,
  DollarOutlined,
  RiseOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/stores/userStore';
import { orderApi } from '@/api/order';
import { productApi } from '@/api/product';
import { Order, Product, OrderStatus } from '@/types';
import { ORDER_STATUS_MAP } from '@/utils/constants';
import dayjs from 'dayjs';

const { Sider, Content, Header } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

export const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUserStore();
  const [activeKey, setActiveKey] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [shipModalVisible, setShipModalVisible] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      message.warning('无权访问管理后台');
      navigate('/');
      return;
    }
    fetchDashboardData();
  }, [activeKey, isAuthenticated, user?.role]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [orderRes, productRes] = await Promise.all([
        orderApi.getOrderList({ page: 1, pageSize: 20 }),
        productApi.getProductList({ page: 1, pageSize: 20 }),
      ]);
      setOrders(orderRes.data?.items || []);
      setProducts(productRes.data?.items || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleShipOrder = (values: any) => {
    if (!selectedOrder) return;
    message.success(`订单 ${selectedOrder.orderNo} 已发货`);
    setShipModalVisible(false);
    fetchDashboardData();
  };

  const menuItems = [
    { key: 'dashboard', icon: <DashboardOutlined />, label: '数据概览' },
    { key: 'orders', icon: <ShoppingOutlined />, label: '订单管理' },
    { key: 'products', icon: <ShopOutlined />, label: '商品管理' },
    { key: 'users', icon: <TeamOutlined />, label: '用户管理' },
    { key: 'promotions', icon: <DollarOutlined />, label: '促销管理' },
  ];

  const stats = [
    { title: '今日订单数', value: orders.filter(o => dayjs(o.createdAt).isSame(dayjs(), 'day')).length, icon: <ShoppingOutlined />, color: '#1890ff' },
    { title: '待处理订单', value: orders.filter(o => ['PENDING', 'PAID'].includes(o.status)).length, icon: <InboxOutlined />, color: '#faad14' },
    { title: '商品总数', value: products.length, icon: <ShopOutlined />, color: '#52c41a' },
    { title: '本月销售额', value: '¥' + orders.filter(o => ['PAID', 'SHIPPED', 'COMPLETED'].includes(o.status)).reduce((sum, o) => sum + o.finalAmount, 0).toFixed(2), icon: <RiseOutlined />, color: '#eb2f96' },
  ];

  const renderDashboard = () => (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: stat.color + '20',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: stat.color,
                  fontSize: 20,
                }}>
                  {stat.icon}
                </div>
                <Statistic title={stat.title} value={stat.value} />
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="最新订单">
            <Table
              dataSource={orders.slice(0, 5)}
              rowKey="id"
              pagination={false}
              size="small"
            >
              <Table.Column title="订单号" dataIndex="orderNo" />
              <Table.Column
                title="状态"
                dataIndex="status"
                render={(v) => {
                  const status = ORDER_STATUS_MAP[v] || { label: v, color: 'default' };
                  return <Tag color={status.color}>{status.label}</Tag>;
                }}
              />
              <Table.Column
                title="金额"
                dataIndex="finalAmount"
                render={(v) => `¥${v.toFixed(2)}`}
              />
              <Table.Column
                title="时间"
                dataIndex="createdAt"
                render={(v) => dayjs(v).format('MM-DD HH:mm')}
              />
            </Table>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="热门商品">
            <Table
              dataSource={products.slice(0, 5)}
              rowKey="id"
              pagination={false}
              size="small"
            >
              <Table.Column title="商品名" dataIndex="name" ellipsis />
              <Table.Column title="销量" dataIndex="sales" />
            </Table>
          </Card>
        </Col>
      </Row>
    </div>
  );

  const renderOrders = () => (
    <Card title="订单管理">
      <Table
        rowKey="id"
        dataSource={orders}
        loading={loading}
        pagination={{ pageSize: 10 }}
      >
        <Table.Column title="订单号" dataIndex="orderNo" />
        <Table.Column
          title="收货人"
          render={(v, record) => `${record.shippingName} ${record.shippingPhone}`}
        />
        <Table.Column
          title="状态"
          dataIndex="status"
          render={(v) => {
            const status = ORDER_STATUS_MAP[v] || { label: v, color: 'default' };
            return <Tag color={status.color}>{status.label}</Tag>;
          }}
        />
        <Table.Column
          title="金额"
          dataIndex="finalAmount"
          render={(v) => <Text strong>¥{v.toFixed(2)}</Text>}
        />
        <Table.Column
          title="下单时间"
          dataIndex="createdAt"
          render={(v) => dayjs(v).format('YYYY-MM-DD HH:mm')}
        />
        <Table.Column
          title="操作"
          render={(v, record) => (
            <Space>
              <Button type="link" onClick={() => navigate(`/orders/${record.id}`)}>
                详情
              </Button>
              {record.status === 'PAID' && (
                <Button
                  type="link"
                  onClick={() => {
                    setSelectedOrder(record as Order);
                    setShipModalVisible(true);
                  }}
                >
                  发货
                </Button>
              )}
            </Space>
          )}
        />
      </Table>
    </Card>
  );

  const renderProducts = () => (
    <Card title="商品管理">
      <Table
        rowKey="id"
        dataSource={products}
        loading={loading}
        pagination={{ pageSize: 10 }}
      >
        <Table.Column
          title="商品"
          dataIndex="name"
          render={(v, record) => (
            <Space>
              <img
                src={record.images?.[0] || 'https://placehold.co/40x40'}
                alt={v}
                style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
              />
              <span>{v}</span>
            </Space>
          )}
        />
        <Table.Column
          title="价格"
          dataIndex="price"
          render={(v) => <Text strong style={{ color: '#ff4d4f' }}>¥{v.toFixed(2)}</Text>}
        />
        <Table.Column title="库存" dataIndex="stock" />
        <Table.Column title="销量" dataIndex="sales" />
        <Table.Column
          title="状态"
          dataIndex="isActive"
          render={(v) => <Tag color={v ? 'green' : 'default'}>{v ? '上架' : '下架'}</Tag>}
        />
        <Table.Column
          title="操作"
          render={() => (
            <Space>
              <Button type="link">编辑</Button>
              <Button type="link" danger>删除</Button>
            </Space>
          )}
        />
      </Table>
    </Card>
  );

  const renderPlaceholder = (title: string) => (
    <Card title={title}>
      <div style={{ textAlign: 'center', padding: 60 }}>
        <Text type="secondary">功能开发中...</Text>
      </div>
    </Card>
  );

  const renderContent = () => {
    switch (activeKey) {
      case 'dashboard':
        return renderDashboard();
      case 'orders':
        return renderOrders();
      case 'products':
        return renderProducts();
      case 'users':
        return renderPlaceholder('用户管理');
      case 'promotions':
        return renderPlaceholder('促销管理');
      default:
        return renderDashboard();
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={220} theme="dark">
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18 }}>
          🌸 管理后台
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activeKey]}
          onClick={({ key }) => setActiveKey(key)}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Title level={5} style={{ margin: 0 }}>
            {menuItems.find(m => m.key === activeKey)?.label as string}
          </Title>
          <Space>
            <Button onClick={() => navigate('/')}>返回商城</Button>
          </Space>
        </Header>
        <Content style={{ margin: 24, minHeight: 280 }}>
          {renderContent()}
        </Content>
      </Layout>

      <Modal
        title="订单发货"
        open={shipModalVisible}
        onCancel={() => setShipModalVisible(false)}
        onOk={() => handleShipOrder({})}
        okText="确认发货"
      >
        {selectedOrder && (
          <div>
            <p>订单号：{selectedOrder.orderNo}</p>
            <p>收货人：{selectedOrder.shippingName}</p>
            <p>地址：{selectedOrder.shippingAddress}</p>
          </div>
        )}
      </Modal>
    </Layout>
  );
};
