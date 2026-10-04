import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout, Row, Col, Card, Select, Input, Checkbox, Empty, Pagination, Typography, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { Product, Category, PaginatedResponse } from '@/types';
import { productApi, ProductQuery } from '@/api/product';
import { ProductCard } from '@/components/ProductCard';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

export const ProductList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 12, total: 0 });

  const keyword = searchParams.get('keyword') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const sortBy = searchParams.get('sortBy') || '';
  const sortOrder = searchParams.get('sortOrder') || 'DESC';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const isFreeShipping = searchParams.get('isFreeShipping') === 'true';

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [keyword, categoryId, sortBy, sortOrder, minPrice, maxPrice, isFreeShipping, pagination.page]);

  const fetchCategories = async () => {
    try {
      const res = await productApi.getCategoryTree();
      setCategories(res.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: ProductQuery = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        keyword: keyword || undefined,
        categoryId: categoryId || undefined,
        sortBy: (sortBy as any) || undefined,
        sortOrder: (sortOrder as any) || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        isFreeShipping: searchParams.has('isFreeShipping') ? isFreeShipping : undefined,
      };
      const res = keyword
        ? await productApi.searchProducts(keyword, params)
        : await productApi.getProductList(params);
      setProducts(res.data?.items || []);
      setPagination((prev) => ({ ...prev, total: res.data?.total || 0 }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateParams = (key: string, value: string | boolean | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === null || value === '') {
      newParams.delete(key);
    } else if (typeof value === 'boolean') {
      if (value) {
        newParams.set(key, 'true');
      } else {
        newParams.delete(key);
      }
    } else {
      newParams.set(key, value);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  return (
    <Content style={{ background: '#f5f5f5' }}>
      <div className="page-container">
        <div className="content-wrapper">
          <Layout style={{ background: 'transparent' }}>
            <Sider
              width={240}
              style={{ background: '#fff', marginRight: 20, borderRadius: 8, padding: 16 }}
            >
              <Title level={5} style={{ marginBottom: 16 }}>商品分类</Title>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div
                  onClick={() => updateParams('categoryId', null)}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    borderRadius: 4,
                    background: !categoryId ? '#52c41a15' : 'transparent',
                    color: !categoryId ? '#52c41a' : '#333',
                  }}
                >
                  全部商品
                </div>
                {categories.map((cat) => (
                  <div key={cat.id}>
                    <div
                      onClick={() => updateParams('categoryId', cat.id)}
                      style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        borderRadius: 4,
                        background: categoryId === cat.id ? '#52c41a15' : 'transparent',
                        color: categoryId === cat.id ? '#52c41a' : '#333',
                      }}
                    >
                      {cat.name}
                    </div>
                    {cat.children?.map((child) => (
                      <div
                        key={child.id}
                        onClick={() => updateParams('categoryId', child.id)}
                        style={{
                          padding: '8px 12px 8px 24px',
                          cursor: 'pointer',
                          borderRadius: 4,
                          background: categoryId === child.id ? '#52c41a15' : 'transparent',
                          color: categoryId === child.id ? '#52c41a' : '#666',
                          fontSize: 13,
                        }}
                      >
                        {child.name}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <Title level={5} style={{ marginTop: 24, marginBottom: 16 }}>价格区间</Title>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Input
                  placeholder="最低"
                  style={{ width: 80 }}
                  value={minPrice}
                  onChange={(e) => updateParams('minPrice', e.target.value)}
                />
                <Text type="secondary">-</Text>
                <Input
                  placeholder="最高"
                  style={{ width: 80 }}
                  value={maxPrice}
                  onChange={(e) => updateParams('maxPrice', e.target.value)}
                />
              </div>

              <Title level={5} style={{ marginTop: 24, marginBottom: 16 }}>筛选条件</Title>
              <Checkbox
                checked={isFreeShipping}
                onChange={(e) => updateParams('isFreeShipping', e.target.checked)}
              >
                包邮
              </Checkbox>
            </Sider>

            <Layout style={{ background: 'transparent' }}>
              <Card
                style={{ marginBottom: 20 }}
                bodyStyle={{ padding: 12 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Text type="secondary">排序：</Text>
                    <Select
                      value={sortBy || 'default'}
                      style={{ width: 140 }}
                      onChange={(value) => {
                        if (value === 'default') {
                          updateParams('sortBy', null);
                          updateParams('sortOrder', null);
                        } else {
                          updateParams('sortBy', value);
                        }
                      }}
                    >
                      <Option value="default">默认排序</Option>
                      <Option value="sales">销量优先</Option>
                      <Option value="price">价格排序</Option>
                      <Option value="rating">评分优先</Option>
                    </Select>
                    {sortBy && (
                      <Select
                        value={sortOrder}
                        style={{ width: 100 }}
                        onChange={(value) => updateParams('sortOrder', value)}
                      >
                        <Option value="ASC">升序</Option>
                        <Option value="DESC">降序</Option>
                      </Select>
                    )}
                  </div>
                  <Text type="secondary">共 {pagination.total} 件商品</Text>
                </div>
              </Card>

              <Spin spinning={loading}>
                {products.length > 0 ? (
                  <div>
                    <Row gutter={[16, 16]}>
                      {products.map((product) => (
                        <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                          <ProductCard product={product} />
                        </Col>
                      ))}
                    </Row>
                    <div style={{ marginTop: 24, textAlign: 'center' }}>
                      <Pagination
                        current={pagination.page}
                        pageSize={pagination.pageSize}
                        total={pagination.total}
                        showSizeChanger
                        onChange={(page, pageSize) => {
                          setPagination((prev) => ({ ...prev, page, pageSize }));
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <Card style={{ textAlign: 'center', padding: 60 }}>
                    <Empty description="暂无商品" />
                  </Card>
                )}
              </Spin>
            </Layout>
          </Layout>
        </div>
      </div>
    </Content>
  );
};
