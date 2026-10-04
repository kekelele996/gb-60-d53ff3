import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from '../auth/dto/auth.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { calcPages } from '../../common/helpers/utils.helper';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }

  async create(registerDto: RegisterDto): Promise<User> {
    const { username, email, password, nickname } = registerDto;

    const existingUsername = await this.findByUsername(username);
    if (existingUsername) {
      throw new ConflictException('用户名已存在');
    }

    const existingEmail = await this.findByEmail(email);
    if (existingEmail) {
      throw new ConflictException('邮箱已被注册');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
      nickname: nickname || username,
    });

    return this.userRepository.save(user);
  }

  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    await this.userRepository.update(userId, {
      refreshToken: refreshToken ? await bcrypt.hash(refreshToken, 10) : null,
    });
  }

  async findOneWithRefreshToken(
    id: string,
    refreshToken: string,
  ): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user || !user.refreshToken) return null;

    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
    return isValid ? user : null;
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, pageSize = 10 } = paginationDto;
    const [users, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
      select: ['id', 'username', 'email', 'nickname', 'avatar', 'phone', 'role', 'isActive', 'createdAt'],
    });

    return {
      list: users,
      total,
      page,
      pageSize,
      pages: calcPages(total, pageSize),
    };
  }

  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    const user = await this.findById(userId);

    if (data.email && data.email !== user.email) {
      const existing = await this.findByEmail(data.email);
      if (existing) {
        throw new ConflictException('邮箱已被使用');
      }
    }

    if (data.username && data.username !== user.username) {
      const existing = await this.findByUsername(data.username);
      if (existing) {
        throw new ConflictException('用户名已被使用');
      }
    }

    Object.assign(user, data);
    return this.userRepository.save(user);
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.findById(userId);

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new ConflictException('旧密码不正确');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);
  }

  async toggleActive(userId: string): Promise<User> {
    const user = await this.findById(userId);
    user.isActive = !user.isActive;
    return this.userRepository.save(user);
  }
}
