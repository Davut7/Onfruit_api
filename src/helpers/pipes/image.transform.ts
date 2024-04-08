import {
  Injectable,
  InternalServerErrorException,
  PipeTransform,
} from '@nestjs/common';
import { ITransformedFile } from '../common/interfaces/ITransformedFile.interface';
import { MinioService } from '../../minio/minio.service';
import { unlink, readFile } from 'fs/promises';
import * as sharp from 'sharp';
@Injectable()
export class ImageTransformer implements PipeTransform<Express.Multer.File> {
  constructor(private readonly minioService: MinioService) {}

  async transform(file: Express.Multer.File): Promise<ITransformedFile> {
    if (!file || !file.path) {
      throw new Error('File or file path is missing.');
    }
    const convertedFileName = file.filename.replace(
      '_uploaded_',
      '_transcoded_',
    );
    try {
      const originalFile = await readFile(file.path);

      const metadata = await sharp(originalFile).metadata();

      const originalWidth = metadata.width;
      const originalHeight = metadata.height;

      let targetWidth: number;
      let targetHeight: number;

      if (originalWidth / originalHeight >= 16 / 9) {
        targetWidth = 1080;
        targetHeight = Math.round((targetWidth * 9) / 16);
      } else {
        targetHeight = 1080;
        targetWidth = Math.round((targetHeight * 16) / 9);
      }

      const maintainAspectRatio =
        targetWidth / targetHeight === originalWidth / originalHeight;

      const transformedStream = sharp(originalFile)
        .resize({
          width: maintainAspectRatio ? undefined : targetWidth,
          height: maintainAspectRatio ? undefined : targetHeight,
          fit: sharp.fit.inside,
          withoutEnlargement: true,
        })
        .jpeg({ quality: 90, progressive: true });

      await this.minioService.uploadFileStream(
        convertedFileName,
        transformedStream,
        'image/jpeg',
      );

      return {
        imageName: convertedFileName,
        imagePath: await this.minioService.getFileUrl(convertedFileName),
        mimeType: file.mimetype,
        originalName: file.originalname,
      };
    } catch (err) {
      console.error(`Error processing file :`, err);
      throw new InternalServerErrorException(
        'Failed to process some files. Please check server logs for details.',
      );
    } finally {
      await unlink(file.path);
    }
  }
}
