import { ApiProperty, PickType } from '@nestjs/swagger';
import { BannerEntity } from '../entities/banner.entity';

export class CreateBannerDto extends PickType(BannerEntity, [
  'bannerNumber',
  'bannerType',
] as const) {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Image file to upload',
    title: 'image',
  })
  image: any;
}
