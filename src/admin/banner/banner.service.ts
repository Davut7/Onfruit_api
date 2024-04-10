import {
  ConflictException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BannerEntity } from './entities/banner.entity';
import { Repository } from 'typeorm';
import { MediaService } from 'src/media/media.service';
import { CreateBannerDto } from './dto/createBannerDto.dto';
import { GetBannersDto } from './dto/getBannersDto.dto';
import { unlink } from 'fs/promises';
import { BannerTypeEnum } from 'src/helpers/constants';

@Injectable()
export class BannerService {
  private readonly logger = new Logger(BannerService.name);

  constructor(
    @InjectRepository(BannerEntity)
    private bannerRepository: Repository<BannerEntity>,
    private mediaService: MediaService,
  ) {}

  async createBanner(dto: CreateBannerDto, image: Express.Multer.File) {
    this.logger.log(`Creating banner with number ${dto.bannerNumber}`);

    const candidate = await this.bannerRepository.findOne({
      where: { bannerNumber: dto.bannerNumber },
    });

    if (candidate) {
      await unlink(image.path);
      this.logger.error(
        `Banner with number ${dto.bannerNumber} already exists`,
      );
      throw new ConflictException(
        `Banner with number ${dto.bannerNumber} already exists`,
      );
    }

    const banner = this.bannerRepository.create(dto);
    await this.bannerRepository.save(banner);

    await this.mediaService.createMedia(image, banner.id, 'bannerId');

    this.logger.log(
      `Banner with number ${dto.bannerNumber} created successfully`,
    );

    return {
      message: 'Banner created successfully',
      banner: banner,
    };
  }

  async getBanners(query?: GetBannersDto) {
    this.logger.log(`Getting banners`);

    const { bannerType = BannerTypeEnum.WEB } = query;
    const bannersQuery = this.bannerRepository
      .createQueryBuilder('banners')
      .leftJoinAndSelect('banners.media', 'media');

    if (query) {
      bannersQuery.where('banners.bannerType = :bannerType', { bannerType });
    }

    const [banners, count] = await bannersQuery.getManyAndCount();

    this.logger.log(`Banners retrieved successfully`);

    return {
      message: 'Banners returned successfully',
      banners: banners,
      bannersCount: count,
    };
  }

  async getOneBanner(bannerId: string) {
    this.logger.log(`Getting banner with ID ${bannerId}`);

    const banner = await this.bannerRepository.findOne({
      where: { id: bannerId },
      relations: { media: true },
    });

    if (!banner) {
      this.logger.error(`Banner with ID ${bannerId} not found`);
      throw new NotFoundException(`Banner with ID ${bannerId} not found`);
    }

    this.logger.log(`Banner with ID ${bannerId} retrieved successfully`);

    return banner;
  }

  async deleteBanner(bannerId: string) {
    this.logger.log(`Deleting banner with ID ${bannerId}`);

    const banner = await this.getOneBanner(bannerId);

    await this.mediaService.deleteOneMedia(banner.media.id);

    await this.bannerRepository.delete(bannerId);

    this.logger.log(`Banner with ID ${bannerId} deleted successfully`);

    return {
      message: 'Banner deleted successfully',
    };
  }
}
