import React from 'react';
import { Layout, Card, Descriptions, Avatar, Typography, Button, Space, Tag } from 'antd';
import { UserOutlined, SettingOutlined, ShoppingOutlined, GiftOutlined, StarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/stores/userStore';
import dayjs from 'dayjs';

const { Content } = Layout;
const { Title, Text } = Typography;

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useUserStore();

  if (!isAuthenticated || !user) {
    return (
      <Content style={{ background: '#f5f5f5' }}>
        <div className="page-container">
          <div className="content-wrapper">
            <Card style={{ textAlign: 'center', padding: 60 }}>
              <Title level={4}>请先登录</Title>
              <Button type="primary" onClick={() => navigate('/login')}>
                去登录
              </Button>
            </Card>
          </div>
        </div>
      </Content>
    );
  }

  const menuItems = [
    {
      icon: <ShoppingOutlined style={{ fontSize: 24 }} />,
      title: '我的订单',
      description: '查看订单历史',
      onClick: () => navigate('/orders'),
    },
    {
      icon: <GiftOutlined style={{ fontSize: 24 }} />,
      title: '我的优惠券',
      description: '查看可用优惠券',
      onClick: () => {},
    },
    {
      icon: <StarOutlined style={{ fontSize: 24 }} />,
      title: '我的评价',
      description: '查看我的评价',
      onClick: () => {},
    },
    {
      icon: <SettingOutlined style={{ fontSize: 24 }} />,
      title: '账户设置',
      description: '修改个人信息',
      onClick: () => {},
    },
  ];

  return (
    <Content style={{ background: '#f5f5f5' }}>
      <div className="page-container">
        <div className="content-wrapper">
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24 }}>
              <Avatar size={80} icon={<UserOutlined />} />
              <div>
                <Title level={3} style={{ marginBottom: 8 }}>{user.username}</Title>
                <Space>
                  <Tag color={user.role === 'ADMIN' ? 'purple' : 'green'}>
                    {user.role === 'ADMIN' ? '管理员' : '普通用户'}
                  </Tag>
                  {user.phone && <Text type="secondary">{user.phone}</Text>}
                </Space>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <Button onClick={logout}>
                  退出登录
                </Button>
              </div>
            </div>

            <Descriptions column={2} bordered>
              <Descriptions.Item label="邮箱">{user.email}</Descriptions.Item>
              <Descriptions.Item label="注册时间">
                {dayjs(user.createdAt).format('YYYY-MM-DD HH:mm')}
              </Descriptions.Item>
              {user.address && (
                <Descriptions.Item label="收货地址" span={2}>
                  {user.address}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          <Card title="快捷入口" style={{ marginTop: 20 }}>
            {menuItems.map((item, index) => (
              <Card.Grid
                key={index}
                hoverable
                style={{ width: '25%', textAlign: 'center', cursor: 'pointer' }}
                onClick={item.onClick}
              >
                <div style={{ color: '#52c41a' }}>{item.icon}</div>
                <div style={{ marginTop: 8, fontWeight: 'bold' }}>{item.title}</div>
                <Text type="secondary" style={{ fontSize: 12 }}>{item.description}</Text>
              </Card.Grid>
            ))}
          </Card>
        </div>
      </div>
    </Content>
  );
};
