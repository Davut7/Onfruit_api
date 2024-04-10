import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Res,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AdminRegistrationUserDto } from './dto/registrationDto.dto';
import { AdminUserLoginDto } from './dto/loginDto.dto';
import { AdminAuthService } from './auth.service';
import {
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
  ApiOperation,
} from '@nestjs/swagger';
import { AdminsEntity } from '../user/entities/adminUsers.entity';
import { RedisService } from 'src/redis/redis.service';
import { AdminGuard } from 'src/helpers/guards/adminGuard.guard';

@ApiTags('admin-auth')
@Controller('admin/auth')
export class AdminAuthController {
  constructor(
    private readonly adminUserAuthService: AdminAuthService,
    private redisService: RedisService,
  ) {}

  @ApiOperation({ summary: 'Register a new system user' })
  @ApiConflictResponse({
    type: ConflictException,
    description: 'User with name already exists!',
  })
  @ApiOkResponse({
    description: 'System user already registered',
    schema: {
      type: 'object',
      properties: {
        user: { $ref: getSchemaPath(AdminsEntity) },
        message: {
          type: 'string',
          example: 'System user registered successfully',
        },
      },
    },
  })
  @Post('/registration')
  async registration(@Body() dto: AdminRegistrationUserDto) {
    return await this.adminUserAuthService.registration(dto);
  }

  @ApiOperation({ summary: 'Login as a system user' })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'System user with this data not found`',
  })
  @ApiOkResponse({
    description: 'System user login successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'System user login successfully!' },
        user: { $ref: getSchemaPath(AdminsEntity) },
        accessToken: { type: 'string', description: 'Users access token' },
        refreshToken: { type: 'string', description: 'Users refresh token' },
      },
    },
  })
  @Post('login')
  async login(@Body() dto: AdminUserLoginDto, @Res() res) {
    const user = await this.adminUserAuthService.login(dto);
    res.cookie('refreshToken', user.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    res.status(200).json({
      message: 'System user login successfully!',
      user: user.user,
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
    });
  }

  @ApiOperation({ summary: 'Refresh user tokens' })
  @ApiUnauthorizedResponse({
    type: UnauthorizedException,
    description: 'System user not authorized',
  })
  @ApiOkResponse({
    description: 'System user refresh successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'System user refresh successfully!',
        },
        user: { $ref: getSchemaPath(AdminsEntity) },
        accessToken: { type: 'string', description: 'Users access token' },
        refreshToken: { type: 'string', description: 'Users refresh token' },
      },
    },
  })
  @Get('refresh')
  async refresh(@Req() req, @Res() res) {
    const refreshToken = req.cookies['refreshToken'];
    const user = await this.adminUserAuthService.refresh(refreshToken);
    res.cookie('refreshToken', user.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    res.status(200).json({
      message: 'System user tokens refreshed successfully!',
      user: user.user,
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
    });
  }

  @ApiOperation({ summary: 'Logout user' })
  @ApiUnauthorizedResponse({
    type: UnauthorizedException,
    description: 'System user not authorized',
  })
  @ApiOkResponse({
    description: 'System user logout successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'System user logout successfully!',
        },
      },
    },
  })
  @UseGuards(AdminGuard)
  @Post('logout')
  async logout(@Req() req, @Res() res) {
    const refreshToken = req.cookies['refreshToken'];
    this.adminUserAuthService.logout(refreshToken);
    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];
    await this.redisService.setTokenWithExpiry(token, token);
    res.clearCookie('refreshToken');
    res.status(200).json({
      message: 'Log out successfully!',
    });
  }
}
