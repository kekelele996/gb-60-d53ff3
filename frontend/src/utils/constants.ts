export const ORDER_STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: '待付款', color: 'orange' },
  PAID: { label: '待发货', color: 'blue' },
  SHIPPED: { label: '已发货', color: 'cyan' },
  COMPLETED: { label: '已完成', color: 'green' },
  CANCELLED: { label: '已取消', color: 'default' },
};

export const SHIPPING_STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: '待发货', color: 'orange' },
  SHIPPED: { label: '已发货', color: 'blue' },
  TRANSIT: { label: '运输中', color: 'cyan' },
  DELIVERED: { label: '已送达', color: 'green' },
};

export const PAYMENT_STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: '待支付', color: 'orange' },
  SUCCESS: { label: '支付成功', color: 'green' },
  FAILED: { label: '支付失败', color: 'red' },
  REFUNDED: { label: '已退款', color: 'default' },
};

export const COUPON_TYPE_MAP: Record<string, { label: string }> = {
  FIXED: { label: '满减券' },
  PERCENT: { label: '折扣券' },
};
