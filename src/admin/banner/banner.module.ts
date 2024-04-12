import { Module } from '@nestjs/common';
import { BannerService } from './banner.service';
import { BannerController } from './banner.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BannerEntity } from './entities/banner.entity';
import { MediaModule } from 'src/media/media.module';
import { AbilityControlModule } from '../abilityControl/abilityControl.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BannerEntity]),
    MediaModule,
    AbilityControlModule,
    RedisModule,
  ],
  controllers: [BannerController],
  providers: [BannerService],
})
export class BannerModule {}
