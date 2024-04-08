import { PickType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { BannerTypeEnum } from 'src/helpers/constants';
import { BannerEntity } from '../entities/banner.entity';

export class GetBannersDto extends PickType(BannerEntity, [
  'bannerType',
] as const) {
  @IsEnum(BannerTypeEnum)
  @IsOptional()
  bannerType: BannerTypeEnum;
}
