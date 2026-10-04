# 花卉电商交易平台

面向花卉爱好者的 B2C 电商平台，支持花卉、绿植、花盆及相关园艺工具的在线购买。

## 快速启动（Docker Compose 一键部署）

```bash
# 1. 复制环境变量配置
cp .env.example .env

# 2. 启动所有服务
docker compose up -d

# 3. 初始化数据库（首次启动需要执行种子数据）
docker exec backend npm run seed
```

启动完成后，访问以下地址：

| 服务 | 地址 |
|------|------|
| 前端商城 | http://localhost:8101 |
| 后端 API | http://localhost:3101 |
| PostgreSQL | localhost:5601 |
| Redis | localhost:6501 |

## 本地开发方式

### 前置要求

- Node.js >= 18
- PostgreSQL >= 14
- Redis >= 6

### 后端启动

```bash
cd backend

# 安装依赖
npm install

# 复制环境变量
cp .env.example .env

# 启动开发服务器
npm run dev

# 初始化种子数据（首次启动）
npm run seed
```

### 前端启动

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端开发服务器地址：http://localhost:5173

## 访问地址

| 环境 | 地址 |
|------|------|
| 开发环境前端 | http://localhost:5173 |
| Docker 部署前端 | http://localhost:8101 |
| 开发环境后端 API | http://localhost:3101/api |
| Docker 部署后端 API | http://localhost:3101/api |

## 默认账号

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | admin@flowershop.com | admin123 |
| 普通用户 | user@flowershop.com | user123 |

## 项目主要功能

- **商品分类与浏览**：多级分类、价格/销量/评分排序、多图轮播
- **商品搜索与推荐**：关键词搜索、价格区间筛选、包邮筛选、个性化推荐
- **购物车与订单管理**：添加/删除/修改数量、订单状态跟踪、取消未付款订单
- **模拟支付**：模拟支付宝沙箱环境，支持支付成功/失败场景
- **物流跟踪**：模拟物流轨迹，展示配送状态
- **用户评价系统**：1-5星评分、文字评价、商家回复
- **优惠券与促销**：满减券、折扣券、限时活动
- **商家后台**：商品管理、订单管理、发货操作、数据统计

## 技术栈

| 分类 | 技术 |
|------|------|
| 前端框架 | React 18 + TypeScript |
| 前端 UI | Ant Design 5 |
| 状态管理 | Zustand |
| 构建工具 | Vite |
| 路由 | React Router 6 |
| 后端框架 | NestJS + TypeScript |
| ORM | TypeORM |
| 数据库 | PostgreSQL |
| 缓存 | Redis |
| 认证 | JWT + Refresh Token |
| 图片存储 | MinIO |
| 容器化 | Docker + Docker Compose |
| Web 服务器 | Nginx |

## 项目目录结构

```
gb-60/
├── backend/                    # 后端项目
│   ├── src/
│   │   ├── common/            # 通用模块（装饰器、守卫、拦截器等）
│   │   │   ├── decorators/
│   │   │   ├── dto/
│   │   │   ├── entities/
│   │   │   ├── filters/
│   │   │   ├── guards/
│   │   │   ├── helpers/
│   │   │   └── interceptors/
│   │   ├── modules/           # 业务模块
│   │   │   ├── auth/          # 认证模块
│   │   │   ├── user/          # 用户模块
│   │   │   ├── product/       # 商品模块
│   │   │   ├── order/         # 订单模块
│   │   │   ├── review/        # 评价模块
│   │   │   └── promotion/     # 促销模块
│   │   ├── seeds/             # 种子数据
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   ├── tsconfig.json
│   └── nest-cli.json
├── frontend/                  # 前端项目
│   ├── src/
│   │   ├── api/               # API 请求层
│   │   ├── components/        # 公共组件
│   │   ├── pages/             # 页面组件
│   │   ├── stores/            # 状态管理
│   │   ├── types/             # 类型定义
│   │   ├── utils/             # 工具函数
│   │   ├── styles/            # 全局样式
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── docker-compose.yml         # Docker Compose 配置
├── .env.example               # 环境变量示例
└── README.md
```

## 环境变量说明

### 根目录 .env（Docker Compose 使用）

```bash
# PostgreSQL 配置
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=flower_shop
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres123

# Redis 配置
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=redis123

# MinIO 配置
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
MINIO_BUCKET=flower-shop

# 后端配置
APP_PORT=3000
JWT_SECRET=your-jwt-secret-key-change-in-production
JWT_EXPIRES_IN=2h
REFRESH_TOKEN_EXPIRES_IN=7d

# 支付宝沙箱配置（模拟支付可不填）
ALIPAY_APP_ID=
ALIPAY_PRIVATE_KEY=
ALIPAY_PUBLIC_KEY=
```

### 前端 .env（开发时使用）

```bash
# API 基础地址
VITE_API_BASE_URL=/api
```

## Docker 部署说明

### 端口映射

| 服务 | 容器端口 | 主机端口 |
|------|----------|----------|
| 前端 (Nginx) | 80 | 8101 |
| 后端 | 3000 | 3101 |
| PostgreSQL | 5432 | 5601 |
| Redis | 6379 | 6501 |

### 数据卷

| 卷名 | 说明 |
|------|------|
| postgres_data | PostgreSQL 数据持久化 |
| redis_data | Redis 数据持久化 |
| minio_data | MinIO 对象存储 |

### 网络

所有服务通过 Docker 内部网络 `flower-shop-network` 通信。

### 常见问题

**1. 后端服务启动失败**
- 检查 PostgreSQL 是否健康（`docker compose ps postgres`）
- 检查数据库连接配置
- 查看后端日志：`docker logs backend`

**2. 前端无法访问后端 API**
- 确认后端服务已启动：`docker compose ps backend`
- 检查 nginx.conf 中的代理配置
- 后端健康检查通过后才会启动

**3. 数据库数据丢失**
- 确保使用了命名卷 `postgres_data`
- 不要执行 `docker compose down -v` 除非想清空数据

**4. 前端页面 404**
- nginx.conf 已配置 `try_files $uri $uri/ /index.html` 支持 SPA 路由
- 确认 Docker 构建时已复制 nginx.conf

## License

MIT
