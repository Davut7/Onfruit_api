import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { BaseEntity } from 'src/helpers/baseEntity.entity';
import { BannerTypeEnum } from 'src/helpers/constants';
import { MediaEntity } from 'src/media/entities/media.entity';
import { Column, Entity, OneToOne } from 'typeorm';

@Entity({ name: 'banners' })
export class BannerEntity extends BaseEntity {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The banner number',
    required: true,
    example: '1',
  })
  @Column({ nullable: false })
  bannerNumber: string;

  @IsNotEmpty()
  @IsEnum(BannerTypeEnum)
  @ApiProperty({
    title: 'Banner type',
    name: 'bannerType',
    description: 'The type of the banner',
    enum: BannerTypeEnum,
    enumName: 'BannerTypeEnum',
    required: true,
  })
  @Column({ type: 'enum', enum: BannerTypeEnum, nullable: false })
  bannerType: BannerTypeEnum;

  @OneToOne(() => MediaEntity, (media) => media.banner)
  media: MediaEntity;
}
