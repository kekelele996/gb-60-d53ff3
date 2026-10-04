import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString()
  @MinLength(3, { message: '用户名至少3个字符' })
  @MaxLength(20, { message: '用户名最多20个字符' })
  username: string;

  @IsNotEmpty({ message: '邮箱不能为空' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @IsNotEmpty({ message: '密码不能为空' })
  @IsString()
  @MinLength(6, { message: '密码至少6个字符' })
  password: string;

  nickname?: string;
}

export class LoginDto {
  @IsNotEmpty({ message: '用户名或邮箱不能为空' })
  @IsString()
  username: string;

  @IsNotEmpty({ message: '密码不能为空' })
  @IsString()
  password: string;
}

export class RefreshTokenDto {
  @IsNotEmpty({ message: 'Refresh Token 不能为空' })
  @IsString()
  refreshToken: string;
}

export class ChangePasswordDto {
  @IsNotEmpty({ message: '旧密码不能为空' })
  @IsString()
  oldPassword: string;

  @IsNotEmpty({ message: '新密码不能为空' })
  @IsString()
  @MinLength(6, { message: '密码至少6个字符' })
  newPassword: string;
}
