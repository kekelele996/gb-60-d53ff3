import React from 'react';
import { Layout } from 'antd';

const { Footer: AntFooter } = Layout;

export const Footer: React.FC = () => {
  return (
    <AntFooter
      style={{
        textAlign: 'center',
        background: '#fff',
        borderTop: '1px solid #f0f0f0',
        marginTop: 20,
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 80, marginBottom: 20 }}>
          <div style={{ textAlign: 'left' }}>
            <h4 style={{ marginBottom: 12 }}>关于我们</h4>
            <p style={{ color: '#666', margin: '4px 0' }}>公司介绍</p>
            <p style={{ color: '#666', margin: '4px 0' }}>联系我们</p>
            <p style={{ color: '#666', margin: '4px 0' }}>人才招聘</p>
          </div>
          <div style={{ textAlign: 'left' }}>
            <h4 style={{ marginBottom: 12 }}>客户服务</h4>
            <p style={{ color: '#666', margin: '4px 0' }}>帮助中心</p>
            <p style={{ color: '#666', margin: '4px 0' }}>退换货政策</p>
            <p style={{ color: '#666', margin: '4px 0' }}>配送说明</p>
          </div>
          <div style={{ textAlign: 'left' }}>
            <h4 style={{ marginBottom: 12 }}>支付方式</h4>
            <p style={{ color: '#666', margin: '4px 0' }}>支付宝</p>
            <p style={{ color: '#666', margin: '4px 0' }}>微信支付</p>
            <p style={{ color: '#666', margin: '4px 0' }}>银行卡</p>
          </div>
          <div style={{ textAlign: 'left' }}>
            <h4 style={{ marginBottom: 12 }}>联系方式</h4>
            <p style={{ color: '#666', margin: '4px 0' }}>客服电话：400-888-8888</p>
            <p style={{ color: '#666', margin: '4px 0' }}>工作时间：9:00-18:00</p>
            <p style={{ color: '#666', margin: '4px 0' }}>邮箱：service@flowershop.com</p>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 20, color: '#999' }}>
          <p>© 2024 花卉商城 版权所有</p>
        </div>
      </div>
    </AntFooter>
  );
};
