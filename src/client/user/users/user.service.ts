import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UserUpdateDto } from './dto/userDto.dto';
import { UserEntity } from './entities/user.entity';
import { DistributerUpdateDto } from './dto/distributerDto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UserTokenDto } from '../token/dto/userToken.dto';
import { MediaService } from 'src/media/media.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private dataSource: DataSource,
    private mediaService: MediaService,
  ) {}

  async getMe(currentUser: UserTokenDto) {
    const user = await this.userRepository
      .createQueryBuilder('users')
      .leftJoinAndSelect('users.media', 'media')
      .where('users.id = :id', { id: currentUser.id })
      .getOne();
    if (!user) throw new NotFoundException(`Your account not found!`);
    return user;
  }

  async updateUser(currentUser: UserEntity, dto: UserUpdateDto) {
    const user = await this.getMe(currentUser);
    if (!user) throw new NotFoundException(`Your account not found!`);
    Object.assign(user, dto);
    await this.userRepository.save(user);
    return user;
  }

  async updateDistributer(currentUser: UserEntity, dto: DistributerUpdateDto) {
    if (currentUser.role !== 'distributor')
      throw new BadRequestException('You must be a distributor');
    const distributer = await this.getMe(currentUser);
    if (!distributer) throw new NotFoundException(`Your account not found!`);
    Object.assign(distributer, dto);
    await this.userRepository.save(distributer);
    return distributer;
  }

  async updateUserImage(currentUser: UserEntity, image: Express.Multer.File) {
    const candidate = await this.getMe(currentUser);

    if (candidate.media) {
      try {
        await this.mediaService.deleteOneMedia(candidate.media.id);
      } catch (err) {
        throw new InternalServerErrorException('Could not delete image');
      }
    }
    const media = await this.mediaService.createMedia(
      image,
      candidate.id,
      'userId',
    );
    return {
      message: 'Image uploaded successfully!',
      media: media,
    };
  }

  async deleteAccount(currentUser: UserEntity) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const user = await queryRunner.manager.findOne(UserEntity, {
        where: { id: currentUser.id },
        relations: { media: true },
      });
      if (!user) throw new BadRequestException();
      await this.mediaService.deleteOneMedia(user.media.id);
      await queryRunner.manager.delete(UserEntity, user.id);
      return { message: 'User deleted successfully!' };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(err);
    } finally {
      await queryRunner.release();
    }
  }
}
