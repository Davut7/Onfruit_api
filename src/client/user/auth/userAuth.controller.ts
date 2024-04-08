import {
  Controller,
  Body,
  Res,
  Req,
  Post,
  Param,
  ParseUUIDPipe,
  UseGuards,
  ConflictException,
  Patch,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UserRegDto, UserLoginDto } from '../users/dto/userDto.dto';
import { ClientAuthService } from './userAuth.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import { DistributerRegDto } from '../users/dto/distributerDto.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConflictResponse,
  ApiOkResponse,
  getSchemaPath,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserEntity } from '../users/entities/user.entity';

@ApiTags('client-auth')
@Controller('client/auth')
export class ClientAuthController {
  constructor(private authService: ClientAuthService) {}

  @ApiOperation({ summary: 'User registration' })
  @ApiConflictResponse({
    type: ConflictException,
    description: 'User with this name already exists',
  })
  @ApiCreatedResponse({
    description: 'User registered successfully',
    schema: {
      type: 'object',
      properties: {
        user: { $ref: getSchemaPath(UserEntity) },
        message: {
          type: 'string',
          example: 'User registered successfully',
        },
      },
    },
  })
  @Post('user/registration')
  async userRegistration(@Body() dto: UserRegDto) {
    return this.authService.userRegistration(dto);
  }

  @ApiOperation({ summary: 'Distributor registration' })
  @ApiCreatedResponse({
    description: 'User registered successfully',
    schema: {
      type: 'object',
      properties: {
        user: { $ref: getSchemaPath(UserEntity) },
        message: {
          type: 'string',
          example: 'Distributer registered successfully',
        },
      },
    },
  })
  @Post('distributer/registration')
  async distributerRegistration(@Body() dto: DistributerRegDto) {
    return this.authService.distributerRegistration(dto);
  }

  @ApiOperation({ summary: 'Verify user account' })
  @ApiOkResponse({
    status: 200,
    description: 'Account verified successfully',
    schema: {
      type: 'object',
      properties: {
        user: { $ref: getSchemaPath(UserEntity) },
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
      },
    },
  })
  @ApiBadRequestResponse({
    type: BadRequestException,
    description: 'Verification code is invalid',
  })
  @ApiBadRequestResponse({
    type: BadRequestException,
    description: 'Verification code is expired',
  })
  @Patch('verify/:userId')
  async verifyUserAccount(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Res({ passthrough: true }) res,
    @Req() req,
  ) {
    const verificationCode = req.body.verificationCode;
    const user = await this.authService.verifyAccount(verificationCode, userId);
    res.cookie('refreshToken', user.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    res.status(200).json({
      message: 'Account verified successfully',
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
    });
  }

  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'User login successfully' },
        id: { type: 'string' },
      },
    },
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'User with this number not found',
  })
  @Post('login')
  async userLogin(@Body() dto: UserLoginDto) {
    return this.authService.userLogin(dto);
  }

  @ApiOperation({ summary: 'User logout' })
  @ApiOkResponse({
    status: 200,
    description: 'User logged out successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'User logged out successfully' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'User unauthorized',
  })
  @Post('logout')
  async userLogout(@Req() req, @Res() res) {
    const refreshToken = req.cookies['refreshToken'];
    this.authService.userLogout(refreshToken);
    res.clearCookie('refreshToken');
    res.status(200).json({
      message: 'User logged out successfully',
    });
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiOkResponse({
    status: 200,
    description: 'Tokens refreshed successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'User unauthorized' })
  @Post('refresh')
  async refreshTokens(@Req() req, @Res() res) {
    const refreshToken = req.cookies['refreshToken']
      ? req.cookies['refreshToken']
      : req.headers['refresh-token'];
    const user = await this.authService.refreshTokens(refreshToken);
    res.cookie('refreshToken', user.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    res.status(200).json({
      message: 'Tokens refreshed successfully',
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
    });
  }

  @ApiOperation({ summary: 'Send activation code' })
  @ApiResponse({
    status: 200,
    description: 'Activation code sent successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Activation code sent successfully',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'User not found',
  })
  @UseGuards(ThrottlerGuard)
  @Post('send-code/:userId')
  async getActivationCode(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.authService.sendActivationCode(userId);
  }
}
