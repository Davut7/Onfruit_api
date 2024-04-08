import {
  Injectable,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { UserRegDto, UserLoginDto } from '../users/dto/userDto.dto';
import { UserTokenDto } from '../token/dto/userToken.dto';
import { UserEntity } from '../users/entities/user.entity';
import { sendActivationCode } from '../../../utils/send-activation';
import { randomCode } from 'src/utils/math-utils';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DistributerRegDto } from '../users/dto/distributerDto.dto';
import { UserTokenService } from '../token/userToken.service';

@Injectable()
export class ClientAuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private tokenService: UserTokenService,
  ) {}

  async userRegistration(dto: UserRegDto) {
    const candidate = await this.userRepository.findOne({
      where: { phoneNumber: dto.phoneNumber },
    });
    if (candidate)
      throw new ConflictException(
        `User with ${dto.phoneNumber} already exists`,
      );
    const user = this.userRepository.create(dto);
    await this.userRepository.save(user);
    await this.sendActivationCode(user.id);
    return {
      id: user.id,
      message: 'User registered successfully!',
    };
  }
  async distributerRegistration(dto: DistributerRegDto) {
    const candidate = await this.userRepository.findOne({
      where: { phoneNumber: dto.phoneNumber },
    });
    if (candidate)
      throw new ConflictException(
        `User with ${dto.phoneNumber} already exists`,
      );
    const user = this.userRepository.create(dto);
    await this.userRepository.save(user);
    await this.sendActivationCode(user.id);
    return {
      id: user.id,
      message: 'Distributer registered successfully!',
    };
  }

  async verifyAccount(verificationCode: string, userId: string) {
    const user = await this.getUserById(userId);
    if (user.activationCode !== verificationCode) {
      throw new BadRequestException(`Wrong verification code`);
    }
    if (Date.now() - +user.codeTime >= 1 * 60 * 1000) {
      throw new BadRequestException('Activation code expired!');
    }
    user.isActivated = true;
    await this.userRepository.update({ id: user.id }, { isActivated: true });
    const userDto = new UserTokenDto(user);
    const tokens = this.tokenService.generateTokens({ ...userDto });
    await this.tokenService.saveToken(user.id, tokens.refreshToken);
    return {
      ...tokens,
      message: 'Account verified successfully!',
    };
  }

  async userLogin(dto: UserLoginDto) {
    const user = await this.getUserByNumber(dto.phoneNumber);
    await this.sendActivationCode(user.id);
    return {
      id: user.id,
      message: 'User login successfully!',
    };
  }

  async userLogout(refreshToken: string) {
    try {
      const tokenData = await this.tokenService.getToken(refreshToken);
      await this.tokenService.deleteToken(refreshToken);
      const user = await this.getUserById(tokenData.id);
      user.isActivated = false;
      await this.userRepository.save(user);
      return { message: 'Token deleted successfully' };
    } catch (err) {
      return { message: 'Error while deleting token' };
    }
  }

  async refreshTokens(refreshToken: string) {
    if (!refreshToken)
      throw new UnauthorizedException({ message: 'User not authorized' });
    const tokenFromDB = await this.tokenService.getToken(refreshToken);
    if (!tokenFromDB)
      throw new UnauthorizedException({ message: 'User not authorized' });
    const validToken = this.tokenService.validateAccessToken(refreshToken);
    if (!validToken && !tokenFromDB)
      throw new UnauthorizedException({ message: 'User not authorized' });
    const user = await this.userRepository.findOne({
      where: { id: tokenFromDB.userId },
    });
    const userDto = new UserTokenDto(user);
    const tokens = this.tokenService.generateTokens({ ...userDto });
    await this.tokenService.saveToken(user.id, tokens.refreshToken);
    return {
      ...tokens,
    };
  }

  async sendActivationCode(userId: string) {
    const user = await this.getUserById(userId);
    user.activationCode = randomCode();
    if (process.env.NODE_ENV === 'development') {
      user.activationCode = '123456';
    }
    await sendActivationCode(user.phoneNumber, user.activationCode);
    user.codeTime = new Date();
    this.userRepository.save(user);
    return {
      message: 'Code sent successfully!',
    };
  }

  async getUserById(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User not found please register`);
    return user;
  }

  async getUserByNumber(phoneNumber: string) {
    const user = await this.userRepository.findOne({
      where: { phoneNumber: phoneNumber },
    });
    if (!user)
      throw new NotFoundException(
        `User with phone number ${phoneNumber} not found! Please register first`,
      );
    return user;
  }
}
