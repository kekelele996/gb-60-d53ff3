import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await this.userService.create(registerDto);
    return this.generateTokens(user);
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    const user =
      (await this.userService.findByUsername(username)) ||
      (await this.userService.findByEmail(username));

    if (!user) {
      throw new UnauthorizedException('用户名或密码不正确');
    }

    if (!user.isActive) {
      throw new ForbiddenException('账号已被禁用');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('用户名或密码不正确');
    }

    return this.generateTokens(user);
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const user = await this.userService.findOneWithRefreshToken(
        payload.sub,
        refreshToken,
      );

      if (!user) {
        throw new UnauthorizedException('无效的 Refresh Token');
      }

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Refresh Token 已过期或无效');
    }
  }

  async logout(userId: string) {
    await this.userService.updateRefreshToken(userId, null);
    return { message: '退出成功' };
  }

  private async generateTokens(user: User) {
    const accessTokenPayload = {
      username: user.username,
      email: user.email,
      role: user.role,
      sub: user.id,
    };

    const accessToken = this.jwtService.sign(accessTokenPayload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '1h',
    });

    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn:
          this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN') || '7d',
      },
    );

    await this.userService.updateRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        phone: user.phone,
        role: user.role,
      },
    };
  }
}
