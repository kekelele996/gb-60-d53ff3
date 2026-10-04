import {
  Controller,
  Get,
  UseGuards,
  Put,
  Body,
  Query,
  Patch,
  Param,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, User } from './entities/user.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Controller('api/users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  async getMe(@CurrentUser() user: any) {
    const fullUser = await this.userService.findById(user.id);
    const { password, refreshToken, ...result } = fullUser;
    return result;
  }

  @Put('me')
  async updateMe(
    @CurrentUser() user: any,
    @Body() data: Partial<User>,
  ) {
    const { password, refreshToken, role, isActive, ...safeData } = data as any;
    const updated = await this.userService.updateProfile(user.id, safeData);
    const { password: _, refreshToken: __, ...result } = updated;
    return result;
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.userService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findById(id);
    const { password, refreshToken, ...result } = user;
    return result;
  }

  @Patch(':id/toggle-active')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async toggleActive(@Param('id') id: string) {
    const user = await this.userService.toggleActive(id);
    const { password, refreshToken, ...result } = user;
    return result;
  }
}
