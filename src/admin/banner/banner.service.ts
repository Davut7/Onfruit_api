import {
  ConflictException,
  Injectable,
  NotFoundException,
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
  constructor(
    @InjectRepository(BannerEntity)
    private bannerRepository: Repository<BannerEntity>,
    private mediaService: MediaService,
  ) {}

  async createBanner(dto: CreateBannerDto, image: Express.Multer.File) {
    const candidate = await this.bannerRepository.findOne({
      where: { bannerNumber: dto.bannerNumber },
    });

    if (candidate) {
      await unlink(image.path);
      throw new ConflictException(
        `Banner with number ${dto.bannerNumber} already exists`,
      );
    }
    const banner = this.bannerRepository.create(dto);
    await this.bannerRepository.save(banner);

    await this.mediaService.createMedia(image, banner.id, 'bannerId');

    return {
      message: 'Banner created successfully',
      banner: banner,
    };
  }

  async getBanners(query?: GetBannersDto) {
    const { bannerType = BannerTypeEnum.WEB } = query;
    const bannersQuery = this.bannerRepository
      .createQueryBuilder('banners')
      .leftJoinAndSelect('banners.media', 'media');

    if (query) {
      bannersQuery.where('banners.bannerType = :bannerType', { bannerType });
    }

    const [banners, count] = await bannersQuery.getManyAndCount();

    return {
      message: 'Banners returned successfully',
      banners: banners,
      bannersCount: count,
    };
  }

  async getOneBanner(bannerId: string) {
    const banner = await this.bannerRepository.findOne({
      where: { id: bannerId },
      relations: { media: true },
    });
    if (!banner) throw new NotFoundException('Banner not found');
    return banner;
  }

  async deleteBanner(bannerId: string) {
    const banner = await this.getOneBanner(bannerId);

    await this.mediaService.deleteOneMedia(banner.media.id);

    await this.bannerRepository.delete(bannerId);
    return {
      message: 'Banner deleted successfully',
    };
  }
}
