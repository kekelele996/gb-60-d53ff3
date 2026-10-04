import React, { useState, useEffect } from 'react';
import { Layout, Input, Button, Badge, Avatar, Dropdown, Menu } from 'antd';
import {
  ShoppingCartOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserStore } from '@/stores/userStore';
import { useCartStore } from '@/stores/cartStore';

const { Header: AntHeader } = Layout;

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchKeyword, setSearchKeyword] = useState('');
  const { user, isAuthenticated, logout } = useUserStore();
  const { cartItems, fetchCart } = useCartStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearch = () => {
    if (searchKeyword.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(searchKeyword.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'orders',
      icon: <ShoppingCartOutlined />,
      label: '我的订单',
      onClick: () => navigate('/orders'),
    },
    ...(user?.role === 'ADMIN'
      ? [
          {
            key: 'admin',
            icon: <DashboardOutlined />,
            label: '管理后台',
            onClick: () => navigate('/admin'),
          },
        ]
      : []),
    {
      key: 'divider',
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <AntHeader
      style={{
        background: '#fff',
        padding: '0 40px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: 64,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 40, maxWidth: 1200, margin: '0 auto' }}>
        <div
          style={{ fontSize: 22, fontWeight: 'bold', color: '#52c41a', cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          🌸 花卉商城
        </div>

        <Input.Search
          placeholder="搜索花卉、绿植、园艺工具..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onSearch={handleSearch}
          enterButton
          style={{ width: 400 }}
        />

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 24 }}>
          <Badge count={cartCount} showZero>
            <Button
              type="text"
              icon={<ShoppingCartOutlined style={{ fontSize: 20 }} />}
              onClick={() => navigate('/cart')}
              style={{ fontSize: 16 }}
            >
              购物车
            </Button>
          </Badge>

          {isAuthenticated ? (
            <Dropdown menu={{ items: userMenuItems }}>
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar icon={<UserOutlined />} />
                <span>{user?.username}</span>
              </div>
            </Dropdown>
          ) : (
            <>
              <Button type="text" onClick={() => navigate('/login')}>
                登录
              </Button>
              <Button type="primary" onClick={() => navigate('/register')}>
                注册
              </Button>
            </>
          )}
        </div>
      </div>
    </AntHeader>
  );
};
