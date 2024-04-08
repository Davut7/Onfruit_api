import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, QueryRunner, Repository } from 'typeorm';
import { MinioService } from 'src/minio/minio.service';
import { ImageTransformer } from 'src/helpers/pipes/image.transform';
import { MediaEntity } from './entities/media.entity';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  constructor(
    @InjectRepository(MediaEntity)
    private mediaRepository: Repository<MediaEntity>,
    private imageTransformer: ImageTransformer,
    private minioService: MinioService,
  ) {}

  async createMedia(
    image: Express.Multer.File,
    entityId: string,
    entityName: string,
  ) {
    this.logger.log(`Uploading one image for product with id ${entityId}`);
    const transformedImage = await this.imageTransformer.transform(image);

    const productImage = this.mediaRepository.create({
      imageName: transformedImage.imageName,
      imagePath: transformedImage.imagePath,
      mimeType: transformedImage.mimeType,
      originalName: transformedImage.originalName,
      [entityName]: entityId,
    });

    await this.mediaRepository.save(productImage);
    this.logger.log(
      `Image for product with id ${entityId} uploaded successfully!`,
    );

    return productImage;
  }

  async deleteOneMedia(mediaId: string) {
    this.logger.log(`Deleting one media with id ${mediaId}!`);
    const media = await this.getOneMedia(mediaId);

    await this.minioService.deleteFile(media.imageName);

    await this.mediaRepository.delete({
      id: mediaId,
    });

    this.logger.log(`Media with id ${mediaId} deleted successfully!`);
    return { message: 'Media deleted successfully!' };
  }

  async getOneMedia(mediaId: string) {
    const media = await this.mediaRepository.findOne({
      where: { id: mediaId },
    });
    if (!media) throw new NotFoundException('Media not found!');
    return media;
  }

  async deleteMedias(mediaIds: string[], queryRunner: QueryRunner) {
    const files = await queryRunner.manager.find(MediaEntity, {
      where: { id: In(mediaIds) },
    });
    if (!files) throw new NotFoundException('Some files are not found!');
    const fileNames = files.map((file) => file.imageName);
    await this.minioService.deleteFiles(fileNames);
    await queryRunner.manager.delete(MediaEntity, { id: In(mediaIds) });
  }
}
