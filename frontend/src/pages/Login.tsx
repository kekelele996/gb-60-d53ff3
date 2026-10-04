import React from 'react';
import { Form, Input, Button, Card, message, Row, Col, Typography } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { authApi, LoginData } from '@/api/auth';
import { useUserStore } from '@/stores/userStore';

const { Title, Text } = Typography;

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, setTokens } = useUserStore();
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values: LoginData) => {
    setLoading(true);
    try {
      const res = await authApi.login(values);
      const { accessToken, refreshToken, user } = res.data;
      setTokens(accessToken, refreshToken);
      setUser(user);
      message.success('登录成功');
      navigate('/');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 140px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <Row gutter={[32, 32]} justify="center" style={{ width: '100%', maxWidth: 900 }}>
        <Col xs={24} lg={12} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 64 }}>🌸</div>
            <Title level={2} style={{ color: '#52c41a', marginBottom: 8 }}>花卉商城</Title>
            <Text type="secondary">您的园艺生活专家</Text>
          </div>
          <Card style={{ borderRadius: 12 }}>
            <Title level={4} style={{ marginBottom: 24, textAlign: 'center' }}>登录账户</Title>
            <Form
              form={form}
              name="login"
              onFinish={onFinish}
              size="large"
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' },
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="邮箱地址" />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="密码" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block loading={loading}>
                  登录
                </Button>
              </Form.Item>

              <div style={{ textAlign: 'center' }}>
                <Text type="secondary">
                  还没有账户？<Link to="/register">立即注册</Link>
                </Text>
              </div>
            </Form>
          </Card>
        </Col>
        <Col xs={0} lg={12} style={{ display: 'flex', alignItems: 'center' }}>
          <Card style={{ width: '100%', height: 500, background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)', borderRadius: 12 }}>
            <div style={{ color: '#fff', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ fontSize: 100 }}>🌿</div>
              <Title level={2} style={{ color: '#fff', marginBottom: 16 }}>欢迎回来</Title>
              <div style={{ fontSize: 16, opacity: 0.9, textAlign: 'center', lineHeight: 1.8 }}>
                探索精选花卉<br />
                打造您的绿色空间
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
