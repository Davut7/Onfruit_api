import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { generateHash, validateHash } from 'src/helpers/common/utils';
import { AdminsEntity } from '../user/entities/adminUsers.entity';
import { AdminRegistrationUserDto } from './dto/registrationDto.dto';
import { AdminUserLoginDto } from './dto/loginDto.dto';
import { AdminTokenDto } from '../token/dto/adminToken.dto';
import { AdminTokenService } from '../token/token.service';
@Injectable()
export class AdminAuthService {
  private readonly logger = new Logger(AdminAuthService.name);
  constructor(
    @InjectRepository(AdminsEntity)
    private adminUserRepository: Repository<AdminsEntity>,
    private adminTokenService: AdminTokenService,
  ) {}

  async registration(dto: AdminRegistrationUserDto) {
    this.logger.log('Registration admin user!');
    const candidate = await this.adminUserRepository.findOne({
      where: { name: dto.name },
    });
    if (candidate) {
      this.logger.error(`This user is already registered!`);
      throw new ConflictException(`User with name ${dto.name} already exists!`);
    }
    dto.password = await generateHash(dto.password);
    dto.confirmPassword = dto.password;
    const user = this.adminUserRepository.create({
      name: dto.name,
      password: dto.password,
      confirmPassword: dto.confirmPassword,
      role: dto.role,
    });

    await this.adminUserRepository.save(user);
    this.logger.log('Admin user registered successfully!');
    return { user, message: 'System user registered successfully' };
  }

  async login(dto: AdminUserLoginDto) {
    this.logger.log('Login admin user!');
    const candidate = await this.adminUserRepository.findOne({
      where: { name: dto.name },
      select: {
        id: true,
        name: true,
        password: true,
        isActive: true,
        role: true,
      },
    });
    if (!candidate) {
      this.logger.error('Admin user not found!');
      throw new NotFoundException(`User with name ${dto.name} not found!`);
    }
    const isPasswordValid = await validateHash(
      dto.password,
      candidate.password,
    );
    if (!isPasswordValid) {
      this.logger.error('Invalid password!');
      throw new NotFoundException(`User password not correct!`);
    }
    const userDto = new AdminTokenDto(candidate);

    const tokens = this.adminTokenService.generateTokens({ ...userDto });
    await this.adminTokenService.saveTokens(userDto.id, tokens.refreshToken);
    this.logger.log('User logged in successfully!');
    return {
      ...tokens,
      user: userDto,
    };
  }

  async refresh(refreshToken: string) {
    if (!refreshToken)
      throw new UnauthorizedException({ message: 'User not authorized' });
    const tokenFromDB = await this.adminTokenService.getToken(refreshToken);
    const validToken =
      this.adminTokenService.validateRefreshToken(refreshToken);
    if (!validToken && !tokenFromDB)
      throw new UnauthorizedException({ message: 'User not authorized' });
    const user = await this.adminUserRepository.findOne({
      where: { id: tokenFromDB.userId },
    });
    const userDto = new AdminTokenDto(user);
    const tokens = this.adminTokenService.generateTokens({ ...userDto });
    await this.adminTokenService.saveTokens(userDto.id, tokens.refreshToken);
    return {
      ...tokens,
      user: userDto,
    };
  }

  async logout(refreshToken: string) {
    this.logger.log('Logout from account!');
    await this.adminTokenService.deleteToken(refreshToken);
    this.logger.log('Logout from account successfully!');
    return { message: 'Token deleted successfully!' };
  }
}
