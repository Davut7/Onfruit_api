import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { UserTokenEntity } from './entities/userToken.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserTokenDto } from './dto/userToken.dto';

@Injectable()
export class UserTokenService {
  constructor(
    @InjectRepository(UserTokenEntity)
    private tokenRepository: Repository<UserTokenEntity>,
  ) {}
  generateTokens(payload: UserTokenDto) {
    const accessToken = jwt.sign(
      payload,
      process.env.JWT_CLIENT_ACCESS_SECRET,
      {
        expiresIn: '5h',
      },
    );
    const refreshToken = jwt.sign(
      payload,
      process.env.JWT_CLIENT_REFRESH_SECRET,
      {
        expiresIn: '30d',
      },
    );
    return {
      accessToken,
      refreshToken,
    };
  }

  async saveToken(userId: string, refreshToken: string) {
    const user = await this.tokenRepository.findOne({
      where: { userId: userId },
    });
    if (user) {
      user.refreshToken = refreshToken;
      return await this.tokenRepository.save(user);
    }
    const token = this.tokenRepository.create({
      userId: userId,
      refreshToken: refreshToken,
    });
    return await this.tokenRepository.save(token);
  }

  async getToken(refreshToken: string) {
    const token = await this.tokenRepository.findOne({
      where: { refreshToken: refreshToken },
    });
    if (!token) throw new UnauthorizedException({ message: 'User not authorized' });
    return token;
  }

  async deleteToken(refreshToken: string) {
    await this.tokenRepository.delete({
      refreshToken: refreshToken,
    });
    return 'Token deleted successfully!';
  }

  validateAccessToken(accessToken: string) {
    try {
      const token = jwt.verify(
        accessToken,
        process.env.JWT_CLIENT_ACCESS_SECRET,
      ) as UserTokenDto;
      return token;
    } catch (err) {
      throw new UnauthorizedException({ message: 'User not authorized' });
    }
  }

  validateRefreshToken(refreshToken: string) {
    try {
      const token = jwt.verify(
        refreshToken,
        process.env.JWT_CLIENT_REFRESH_SECRET,
      ) as UserTokenDto;
      return token;
    } catch (err) {
      throw new UnauthorizedException({ message: 'User not authorized' });
    }
  }
}
