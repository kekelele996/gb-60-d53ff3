import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Card, Table, Image, InputNumber, Button, Checkbox, Space, Typography, Empty, Tag, message, Modal, Form, Input, Select } from 'antd';
import { DeleteOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import type { UserCoupon } from '@/types';
import { useCartStore } from '@/stores/cartStore';
import { useUserStore } from '@/stores/userStore';
import { orderApi } from '@/api/order';
import { promotionApi } from '@/api/promotion';
import { ORDER_STATUS_MAP, COUPON_TYPE_MAP } from '@/utils/constants';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Column } = Table;

export const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();
  const { cartItems, loading, fetchCart, updateQuantity, toggleSelect, toggleSelectAll, removeItem, getSelectedItems, getSelectedTotal } = useCartStore();
  const [myCoupons, setMyCoupons] = React.useState<UserCoupon[]>([]);
  const [checkoutModalVisible, setCheckoutModalVisible] = React.useState(false);
  const [checkoutForm] = Form.useForm();

  useEffect(() => {
    if (!isAuthenticated) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    fetchCart();
    fetchMyCoupons();
  }, [isAuthenticated]);

  const fetchMyCoupons = async () => {
    try {
      const res = await promotionApi.getMyCoupons('UNUSED');
      setMyCoupons(res.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const selectedItems = getSelectedItems();
  const { totalPrice, totalCount } = getSelectedTotal();
  const allSelected = cartItems.length > 0 && cartItems.every((item) => item.selected);
  const selectedCount = selectedItems.length;

  const handleCheckout = async () => {
    if (selectedItems.length === 0) {
      message.warning('请选择要结算的商品');
      return;
    }
    setCheckoutModalVisible(true);
  };

  const handleSubmitOrder = async (values: any) => {
    try {
      const cartIds = selectedItems.map((item) => item.id);
      const res = await orderApi.createOrder({
        cartIds,
        shippingName: values.shippingName,
        shippingPhone: values.shippingPhone,
        shippingAddress: values.shippingAddress,
        couponId: values.couponId,
        remark: values.remark,
      });
      message.success('订单创建成功');
      setCheckoutModalVisible(false);
      await fetchCart();
      navigate(`/orders/${res.data.id}/pay`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Content style={{ background: '#f5f5f5' }}>
      <div className="page-container">
        <div className="content-wrapper">
          <Card
            title={
              <Space>
                <ShoppingCartOutlined />
                <span>购物车</span>
                <Tag color="green">{cartItems.length} 件商品</Tag>
              </Space>
            }
          >
            {cartItems.length > 0 ? (
              <>
                <Table
                  rowKey="id"
                  dataSource={cartItems}
                  pagination={false}
                  loading={loading}
                  rowSelection={{
                    selectedRowKeys: selectedItems.map((item) => item.id),
                    onSelectAll: (selected) => toggleSelectAll(selected),
                    onSelect: (record, selected) => toggleSelect(record.id, selected),
                  }}
                >
                  <Column
                    title="商品信息"
                    dataIndex="product"
                    render={(product) =>
                      product ? (
                        <Space>
                          <Image
                            width={80}
                            height={80}
                            src={product.images?.[0] || 'https://placehold.co/80x80'}
                            style={{ cursor: 'pointer' }}
                            onClick={() => navigate(`/products/${product.id}`)}
                          />
                          <div style={{ maxWidth: 300 }}>
                            <Text
                              style={{ cursor: 'pointer', display: 'block', marginBottom: 4 }}
                              onClick={() => navigate(`/products/${product.id}`)}
                            >
                              {product.name}
                            </Text>
                            {product.isFreeShipping && <Tag color="green">包邮</Tag>}
                          </div>
                        </Space>
                      ) : null
                    }
                  />
                  <Column
                    title="单价"
                    dataIndex="product"
                    render={(product) =>
                      product ? <Text strong style={{ color: '#ff4d4f' }}>¥{product.price.toFixed(2)}</Text> : null
                    }
                  />
                  <Column
                    title="数量"
                    dataIndex="id"
                    render={(id, record) => (
                      <InputNumber
                        min={1}
                        max={record.product?.stock || 999}
                        value={record.quantity}
                        onChange={(value) => updateQuantity(id, value || 1)}
                      />
                    )}
                  />
                  <Column
                    title="小计"
                    dataIndex="id"
                    render={(id, record) => {
                      const price = record.product?.price || 0;
                      return (
                        <Text strong style={{ color: '#ff4d4f', fontSize: 16 }}>
                          ¥{(price * record.quantity).toFixed(2)}
                        </Text>
                      );
                    }}
                  />
                  <Column
                    title="操作"
                    dataIndex="id"
                    render={(id) => (
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeItem(id)}
                      >
                        删除
                      </Button>
                    )}
                  />
                </Table>

                <Card
                  style={{ marginTop: 20, padding: 16 }}
                  bodyStyle={{ padding: 0 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space>
                      <Checkbox
                        checked={allSelected}
                        onChange={(e) => toggleSelectAll(e.target.checked)}
                      >
                        全选
                      </Checkbox>
                      <Button
                        danger
                        type="text"
                        disabled={selectedCount === 0}
                      >
                        删除选中
                      </Button>
                    </Space>
                    <Space size={24}>
                      <div>
                        <Text type="secondary">已选择 </Text>
                        <Text strong style={{ color: '#52c41a' }}>{selectedCount}</Text>
                        <Text type="secondary"> 件商品</Text>
                      </div>
                      <div>
                        <Text type="secondary">合计：</Text>
                        <Text strong style={{ color: '#ff4d4f', fontSize: 24 }}>¥{totalPrice.toFixed(2)}</Text>
                      </div>
                      <Button
                        type="primary"
                        size="large"
                        disabled={selectedCount === 0}
                        onClick={handleCheckout}
                        style={{ background: '#ff4d4f', borderColor: '#ff4d4f' }}
                      >
                        去结算
                      </Button>
                    </Space>
                  </div>
                </Card>
              </>
            ) : (
              <Empty
                description="购物车是空的"
                style={{ padding: 60 }}
              >
                <Button type="primary" onClick={() => navigate('/products')}>
                  去逛逛
                </Button>
              </Empty>
            )}
          </Card>
        </div>
      </div>

      <Modal
        title="确认订单"
        open={checkoutModalVisible}
        onCancel={() => setCheckoutModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form form={checkoutForm} layout="vertical" onFinish={handleSubmitOrder}>
          <Title level={5}>收货信息</Title>
          <Form.Item
            name="shippingName"
            label="收货人"
            rules={[{ required: true, message: '请输入收货人' }]}
          >
            <Input placeholder="请输入收货人姓名" />
          </Form.Item>
          <Form.Item
            name="shippingPhone"
            label="联系电话"
            rules={[
              { required: true, message: '请输入联系电话' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' },
            ]}
          >
            <Input placeholder="请输入联系电话" />
          </Form.Item>
          <Form.Item
            name="shippingAddress"
            label="收货地址"
            rules={[{ required: true, message: '请输入收货地址' }]}
          >
            <Input.TextArea rows={3} placeholder="请输入详细收货地址" />
          </Form.Item>

          <Title level={5}>选择优惠券</Title>
          <Form.Item name="couponId" label="优惠券">
            <Select placeholder="不使用优惠券" allowClear>
              {myCoupons
                .filter((uc) => uc.coupon)
                .map((uc) => {
                  const coupon = uc.coupon!;
                  return (
                    <Select.Option key={uc.id} value={uc.id}>
                      {COUPON_TYPE_MAP[coupon.type].label}
                      {coupon.type === 'FIXED' ? ` ¥${coupon.value}` : ` ${coupon.value * 10}折`}
                      (满{coupon.minOrderAmount}元可用)
                    </Select.Option>
                  );
                })}
            </Select>
          </Form.Item>

          <Form.Item name="remark" label="订单备注">
            <Input.TextArea rows={2} placeholder="选填，告诉卖家您的特殊要求" />
          </Form.Item>

          <Card size="small" style={{ background: '#fff7e6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text type="secondary">商品数量：</Text>
                <Text strong>{totalCount} 件</Text>
              </div>
              <div>
                <Text type="secondary">应付金额：</Text>
                <Text strong style={{ color: '#ff4d4f', fontSize: 20 }}>¥{totalPrice.toFixed(2)}</Text>
              </div>
            </div>
          </Card>

          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setCheckoutModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit" style={{ background: '#ff4d4f', borderColor: '#ff4d4f' }}>
                提交订单
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Content>
  );
};
