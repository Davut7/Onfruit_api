import {
  Controller,
  Body,
  Get,
  Res,
  Req,
  Post,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { UserRegDto, UserLoginDto } from '../users/dto/userDto.dto';
import { ClientAuthService } from './userAuth.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import { DistributerRegDto } from '../users/dto/distributerDto.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('client/auth')
export class ClientAuthController {
  constructor(private authService: ClientAuthService) {}

  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @Post('user/registration')
  async userRegistration(@Body() dto: UserRegDto) {
    return this.authService.userRegistration(dto);
  }

  @ApiOperation({ summary: 'Distributor registration' })
  @ApiResponse({
    status: 201,
    description: 'Distributor registered successfully',
  })
  @Post('distributer/registration')
  async distributerRegistration(@Body() dto: DistributerRegDto) {
    return this.authService.distributerRegistration(dto);
  }

  @ApiOperation({ summary: 'Verify user account' })
  @ApiResponse({ status: 200, description: 'Account verified successfully' })
  @Post('verify/:id')
  async verifyUserAccount(
    @Param('id', ParseUUIDPipe) id: string,
    @Res({ passthrough: true }) res,
    @Req() req,
  ) {
    const verificationCode = req.body.verificationCode;
    const user = await this.authService.verifyAccount(verificationCode, id);
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
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @Post('login')
  async userLogin(@Body() dto: UserLoginDto) {
    return this.authService.userLogin(dto);
  }

  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'User logged out successfully' })
  @Post('logout')
  async userLogout(@Req() req, @Res() res) {
    const refreshToken = req.cookies['refreshToken'];
    this.authService.userLogout(refreshToken);
    res.clearCookie('refreshToken');
    res.status(200).json({
      message: 'User logged out',
    });
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Tokens refreshed successfully' })
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
  })
  @UseGuards(ThrottlerGuard)
  @Post(':id')
  async getActivationCode(@Param('id', ParseUUIDPipe) id: string) {
    return this.authService.sendActivationCode(id);
  }
}
