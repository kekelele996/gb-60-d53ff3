import React from 'react';
import { Form, Input, Button, Card, message, Row, Col, Typography } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { authApi, RegisterData } from '@/api/auth';

const { Title, Text } = Typography;

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values: RegisterData) => {
    setLoading(true);
    try {
      await authApi.register(values);
      message.success('注册成功，请登录');
      navigate('/login');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 140px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <Row gutter={[32, 32]} justify="center" style={{ width: '100%', maxWidth: 900 }}>
        <Col xs={24} lg={12} style={{ display: 'flex', alignItems: 'center' }}>
          <Card style={{ width: '100%', height: 550, background: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)', borderRadius: 12 }}>
            <div style={{ color: '#fff', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ fontSize: 100 }}>🌺</div>
              <Title level={2} style={{ color: '#fff', marginBottom: 16 }}>加入我们</Title>
              <div style={{ fontSize: 16, opacity: 0.9, textAlign: 'center', lineHeight: 1.8 }}>
                注册成为会员<br />
                享受更多优惠和专属服务
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 48 }}>🌸</div>
            <Title level={3} style={{ color: '#52c41a', marginBottom: 4 }}>花卉商城</Title>
          </div>
          <Card style={{ borderRadius: 12 }}>
            <Title level={4} style={{ marginBottom: 24, textAlign: 'center' }}>创建账户</Title>
            <Form
              form={form}
              name="register"
              onFinish={onFinish}
              size="large"
            >
              <Form.Item
                name="username"
                rules={[
                  { required: true, message: '请输入用户名' },
                  { min: 2, max: 20, message: '用户名长度为2-20个字符' },
                ]}
              >
                <Input prefix={<UserOutlined />} placeholder="用户名" />
              </Form.Item>

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
                rules={[
                  { required: true, message: '请输入密码' },
                  { min: 6, max: 20, message: '密码长度为6-20个字符' },
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="密码" />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: '请确认密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="确认密码" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block loading={loading}>
                  注册
                </Button>
              </Form.Item>

              <div style={{ textAlign: 'center' }}>
                <Text type="secondary">
                  已有账户？<Link to="/login">立即登录</Link>
                </Text>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
