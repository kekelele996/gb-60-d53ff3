import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { User, UserRole } from '../modules/user/entities/user.entity';
import { Category } from '../modules/product/entities/category.entity';
import { Product, ProductStatus } from '../modules/product/entities/product.entity';
import { Coupon, CouponType, CouponStatus } from '../modules/promotion/entities/coupon.entity';
import { Promotion } from '../modules/promotion/entities/coupon.entity';

export async function runSeeds(dataSource: DataSource) {
  console.log('Starting seed...');

  const userRepo = dataSource.getRepository(User);
  const categoryRepo = dataSource.getRepository(Category);
  const productRepo = dataSource.getRepository(Product);
  const couponRepo = dataSource.getRepository(Coupon);
  const promotionRepo = dataSource.getRepository(Promotion);

  const existingUsers = await userRepo.count();
  if (existingUsers === 0) {
    console.log('Seeding users...');

    const admin = userRepo.create({
      username: 'admin',
      email: 'admin@flower-shop.com',
      password: await bcrypt.hash('admin123', 10),
      nickname: '管理员',
      role: UserRole.ADMIN,
      isActive: true,
    });

    const user = userRepo.create({
      username: 'user',
      email: 'user@flower-shop.com',
      password: await bcrypt.hash('user123', 10),
      nickname: '测试用户',
      role: UserRole.USER,
      isActive: true,
      phone: '13800138000',
      address: '北京市朝阳区测试街道123号',
    });

    await userRepo.save([admin, user]);
    console.log('Users seeded: admin/admin123, user/user123');
  }

  const existingCategories = await categoryRepo.count();
  if (existingCategories === 0) {
    console.log('Seeding categories...');

    const categoriesData = [
      { name: '鲜切花', nameEn: 'Fresh Cut Flowers', icon: '🌸', sort: 1 },
      { name: '盆栽花卉', nameEn: 'Potted Flowers', icon: '🪴', sort: 2 },
      { name: '多肉植物', nameEn: 'Succulents', icon: '🌵', sort: 3 },
      { name: '绿植', nameEn: 'Green Plants', icon: '🌿', sort: 4 },
      { name: '花盆', nameEn: 'Flower Pots', icon: '🏺', sort: 5 },
      { name: '园艺工具', nameEn: 'Garden Tools', icon: '🔧', sort: 6 },
    ];

    const savedCategories = await categoryRepo.save(
      categoriesData.map((c) => categoryRepo.create(c)),
    );

    console.log(`Categories seeded: ${savedCategories.length}`);

    const existingProducts = await productRepo.count();
    if (existingProducts === 0) {
      console.log('Seeding products...');

      const [freshCut, potted, succulents, green, pots, tools] = savedCategories;

      const productsData = [
        {
          name: '红玫瑰花束',
          shortDescription: '精选厄瓜多尔红玫瑰11枝，浪漫首选',
          description: '精选进口厄瓜多尔红玫瑰，花头饱满，花期长。搭配满天星和尤加利叶，是表达爱意的最佳选择。',
          price: 199,
          originalPrice: 299,
          stock: 100,
          salesCount: 156,
          viewCount: 892,
          avgRating: 4.8,
          reviewCount: 42,
          images: [],
          thumbnail: '',
          shippingOrigin: '云南昆明',
          isFreeShipping: true,
          shippingFee: 0,
          categoryId: freshCut.id,
          status: ProductStatus.ON_SALE,
        },
        {
          name: '向日葵花束',
          shortDescription: '阳光明媚，活力满满',
          description: '精选优质向日葵，花头大而饱满，色彩鲜艳。象征阳光、热情与活力。',
          price: 129,
          originalPrice: 169,
          stock: 80,
          salesCount: 89,
          viewCount: 456,
          avgRating: 4.6,
          reviewCount: 23,
          images: [],
          thumbnail: '',
          shippingOrigin: '云南昆明',
          isFreeShipping: true,
          shippingFee: 0,
          categoryId: freshCut.id,
          status: ProductStatus.ON_SALE,
        },
        {
          name: '百合花束',
          shortDescription: '清新淡雅，优雅迷人',
          description: '香水百合，香气宜人，花型优美。适合送给长辈或探望病人。',
          price: 159,
          originalPrice: 199,
          stock: 60,
          salesCount: 67,
          viewCount: 345,
          avgRating: 4.9,
          reviewCount: 18,
          images: [],
          thumbnail: '',
          shippingOrigin: '云南昆明',
          isFreeShipping: false,
          shippingFee: 15,
          categoryId: freshCut.id,
          status: ProductStatus.ON_SALE,
        },
        {
          name: '郁金香花束',
          shortDescription: '荷兰进口，高贵典雅',
          description: '荷兰进口郁金香，色彩丰富，花型优美。适合各种场合的送礼选择。',
          price: 189,
          originalPrice: 249,
          stock: 50,
          salesCount: 45,
          viewCount: 234,
          avgRating: 4.7,
          reviewCount: 12,
          images: [],
          thumbnail: '',
          shippingOrigin: '上海',
          isFreeShipping: true,
          shippingFee: 0,
          categoryId: freshCut.id,
          status: ProductStatus.ON_SALE,
        },
        {
          name: '君子兰盆栽',
          shortDescription: '室内观赏佳品，寓意吉祥',
          description: '君子兰是常见的室内观赏植物，叶片肥厚有光泽，花形优美。寓意高贵、君子之风。',
          price: 299,
          originalPrice: 399,
          stock: 30,
          salesCount: 34,
          viewCount: 189,
          avgRating: 4.5,
          reviewCount: 8,
          images: [],
          thumbnail: '',
          shippingOrigin: '广东广州',
          isFreeShipping: false,
          shippingFee: 25,
          categoryId: potted.id,
          status: ProductStatus.ON_SALE,
        },
        {
          name: '蝴蝶兰盆栽',
          shortDescription: '花中皇后，高雅华贵',
          description: '蝴蝶兰是著名的观赏花卉，花型优美，花期长。适合客厅、办公室摆放。',
          price: 399,
          originalPrice: 499,
          stock: 25,
          salesCount: 28,
          viewCount: 156,
          avgRating: 4.8,
          reviewCount: 6,
          images: [],
          thumbnail: '',
          shippingOrigin: '广东广州',
          isFreeShipping: true,
          shippingFee: 0,
          categoryId: potted.id,
          status: ProductStatus.ON_SALE,
        },
        {
          name: '多肉组合盆栽',
          shortDescription: '萌趣可爱，懒人必备',
          description: '精选5-6种不同品种多肉植物，搭配精美花盆，观赏性强，养护简单。',
          price: 99,
          originalPrice: 139,
          stock: 200,
          salesCount: 456,
          viewCount: 1234,
          avgRating: 4.7,
          reviewCount: 89,
          images: [],
          thumbnail: '',
          shippingOrigin: '福建漳州',
          isFreeShipping: true,
          shippingFee: 0,
          categoryId: succulents.id,
          status: ProductStatus.ON_SALE,
        },
        {
          name: '龟背竹',
          shortDescription: '网红绿植，净化空气',
          description: '龟背竹叶片形态独特，是室内装饰的热门选择。同时具有良好的空气净化能力。',
          price: 168,
          originalPrice: 218,
          stock: 40,
          salesCount: 78,
          viewCount: 567,
          avgRating: 4.6,
          reviewCount: 25,
          images: [],
          thumbnail: '',
          shippingOrigin: '广东广州',
          isFreeShipping: false,
          shippingFee: 20,
          categoryId: green.id,
          status: ProductStatus.ON_SALE,
        },
        {
          name: '绿萝',
          shortDescription: '新手友好，好养活',
          description: '绿萝是最常见的室内绿植之一，生命力强，养护简单，是新手的最佳选择。',
          price: 29,
          originalPrice: 49,
          stock: 500,
          salesCount: 892,
          viewCount: 2345,
          avgRating: 4.5,
          reviewCount: 156,
          images: [],
          thumbnail: '',
          shippingOrigin: '广东广州',
          isFreeShipping: true,
          shippingFee: 0,
          categoryId: green.id,
          status: ProductStatus.ON_SALE,
        },
        {
          name: '陶瓷花盆套装',
          shortDescription: '简约北欧风，三件套',
          description: '优质陶瓷材质，简约北欧风格设计。大中小三件套，满足不同植物需求。',
          price: 59,
          originalPrice: 89,
          stock: 150,
          salesCount: 234,
          viewCount: 678,
          avgRating: 4.4,
          reviewCount: 67,
          images: [],
          thumbnail: '',
          shippingOrigin: '广东潮州',
          isFreeShipping: false,
          shippingFee: 12,
          categoryId: pots.id,
          status: ProductStatus.ON_SALE,
        },
        {
          name: '园艺工具套装',
          shortDescription: '种花好帮手，8件套',
          description: '包含铲子、耙子、修枝剪等8件常用园艺工具，满足日常园艺需求。',
          price: 49,
          originalPrice: 79,
          stock: 200,
          salesCount: 178,
          viewCount: 456,
          avgRating: 4.3,
          reviewCount: 45,
          images: [],
          thumbnail: '',
          shippingOrigin: '浙江金华',
          isFreeShipping: true,
          shippingFee: 0,
          categoryId: tools.id,
          status: ProductStatus.ON_SALE,
        },
        {
          name: '营养土通用型',
          shortDescription: '优质营养土，5L装',
          description: '精选进口泥炭土、珍珠岩、蛭石等材料配制，疏松透气，保水保肥。',
          price: 19,
          originalPrice: 29,
          stock: 1000,
          salesCount: 1234,
          viewCount: 3456,
          avgRating: 4.6,
          reviewCount: 234,
          images: [],
          thumbnail: '',
          shippingOrigin: '江苏宿迁',
          isFreeShipping: false,
          shippingFee: 8,
          categoryId: tools.id,
          status: ProductStatus.ON_SALE,
        },
      ];

      await productRepo.save(
        productsData.map((p) => productRepo.create(p)),
      );
      console.log(`Products seeded: ${productsData.length}`);
    }
  }

  const existingCoupons = await couponRepo.count();
  if (existingCoupons === 0) {
    console.log('Seeding coupons...');

    const now = new Date();
    const validTo = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const couponsData = [
      {
        code: 'NEW100',
        name: '新人专享满减券',
        description: '新用户首单满200减100',
        type: CouponType.FULL_REDUCTION,
        minAmount: 200,
        discountAmount: 100,
        totalCount: 100,
        usedCount: 0,
        perUserLimit: 1,
        validTo,
        status: CouponStatus.ACTIVE,
        isNewUserOnly: true,
      },
      {
        code: 'SALE20',
        name: '全场8折券',
        description: '全场通用8折，最高减50元',
        type: CouponType.DISCOUNT,
        minAmount: 100,
        discountRate: 0.8,
        maxDiscountAmount: 50,
        totalCount: 500,
        usedCount: 0,
        perUserLimit: 2,
        validTo,
        status: CouponStatus.ACTIVE,
        isNewUserOnly: false,
      },
      {
        code: 'FREESHIP',
        name: '包邮券',
        description: '全场通用包邮券',
        type: CouponType.FREE_SHIPPING,
        minAmount: 0,
        totalCount: 1000,
        usedCount: 0,
        perUserLimit: 5,
        validTo,
        status: CouponStatus.ACTIVE,
        isNewUserOnly: false,
      },
    ];

    await couponRepo.save(
      couponsData.map((c) => couponRepo.create(c)),
    );
    console.log(`Coupons seeded: ${couponsData.length}`);
  }

  const existingPromotions = await promotionRepo.count();
  if (existingPromotions === 0) {
    console.log('Seeding promotions...');

    const now = new Date();
    const endTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const promotion = promotionRepo.create({
      name: '春季花卉节',
      description: '全场满300减30，限时优惠！',
      startTime: now,
      endTime,
      minAmount: 300,
      discountAmount: 30,
      isActive: true,
    });

    await promotionRepo.save(promotion);
    console.log('Promotions seeded');
  }

  console.log('Seeding completed!');
}
