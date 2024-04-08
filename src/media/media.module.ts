import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageTransformer } from 'src/helpers/pipes/image.transform';
import { MinioModule } from 'src/minio/minio.module';
import { MediaService } from './media.service';
import { MediaEntity } from './entities/media.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MediaEntity]), MinioModule],
  providers: [MediaService, ImageTransformer],
  exports: [MediaService, ImageTransformer, MinioModule],
})
export class MediaModule {}
