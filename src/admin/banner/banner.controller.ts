import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { BannerService } from './banner.service';
import { CreateBannerDto } from './dto/createBannerDto.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { imageFilter } from 'src/helpers/filters/imageFilter';
import { GetBannersDto } from './dto/getBannersDto.dto';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { BannerEntity } from './entities/banner.entity';

@ApiTags('banners')
@ApiBearerAuth()
@Controller('admin/banner')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @ApiCreatedResponse({
    description: 'Banner created successfully',
    schema: {
      type: 'object',
      properties: {
        banner: { $ref: getSchemaPath(BannerEntity) },
        message: { type: 'string', example: 'Banner created successfully' },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @ApiConflictResponse({
    type: ConflictException,
    description: 'Banner with this name already exists',
  })
  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './temp',
        filename: (req, file, cb) => {
          const uniqueFileName =
            randomUUID() + `_uploaded_${file.originalname}`;
          cb(null, uniqueFileName);
        },
      }),
      fileFilter: imageFilter,
      limits: {
        fileSize: 25 * 1024 * 1024,
      },
    }),
  )
  async createBanner(
    @Body() dto: CreateBannerDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.bannerService.createBanner(dto, image);
  }

  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        banners: {
          type: 'array',
          items: { $ref: getSchemaPath(BannerEntity) },
        },
        bannersCount: { type: 'number', example: 'Returned banners count' },
        message: { type: 'string', example: 'Banners returned successfully' },
      },
    },
    description: 'Banners returned successfully',
  })
  @Get()
  async getBanner(@Query() query: GetBannersDto) {
    return this.bannerService.getBanners(query);
  }

  @ApiOkResponse({
    type: BannerEntity,
    description: 'Banner returned successfully',
  })
  @ApiParam({ type: 'string', name: 'id', description: 'Banner id' })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Banner not found',
  })
  @Get(':id')
  async getOneBanner(@Param('id', ParseUUIDPipe) bannerId: string) {
    return this.bannerService.getOneBanner(bannerId);
  }

  @ApiResponse({
    status: 200,
    description: 'Banner deleted successfully',
    schema: { type: 'object', properties: { message: { type: 'string' } } },
  })
  @ApiParam({ type: 'string', name: 'id', description: 'Banner id' })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Banner not found',
  })
  @Delete(':id')
  async deleteBanner(@Param('id', ParseUUIDPipe) bannerId: string) {
    return this.bannerService.deleteBanner(bannerId);
  }
}
