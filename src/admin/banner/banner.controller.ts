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
  UseGuards,
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
  ApiTags,
  getSchemaPath,
  ApiOperation,
} from '@nestjs/swagger';
import { BannerEntity } from './entities/banner.entity';
import { AbilitiesGuard } from 'src/helpers/guards/abilities.guard';
import { CheckAbilities } from 'src/helpers/common/decorators/abilityDecorator.decorator';
import { ActionEnum, SubjectEnum } from 'src/helpers/constants';

@ApiTags('banners')
@ApiBearerAuth()
@UseGuards(AbilitiesGuard)
@Controller('admin/banner')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @ApiOperation({ summary: 'Create a new banner' })
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
  @CheckAbilities({
    action: ActionEnum.Create,
    subject: SubjectEnum.Advertisement,
  })
  async createBanner(
    @Body() dto: CreateBannerDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.bannerService.createBanner(dto, image);
  }

  @ApiOperation({ summary: 'Get banners' })
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
  @CheckAbilities({
    action: ActionEnum.Read,
    subject: SubjectEnum.Advertisement,
  })
  async getBanner(@Query() query: GetBannersDto) {
    return this.bannerService.getBanners(query);
  }

  @ApiOperation({ summary: 'Get one banner by ID' })
  @ApiOkResponse({
    type: BannerEntity,
    description: 'Banner returned successfully',
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Banner not found',
  })
  @Get(':bannerId')
  @CheckAbilities({
    action: ActionEnum.Read,
    subject: SubjectEnum.Advertisement,
  })
  async getOneBanner(@Param('bannerId', ParseUUIDPipe) bannerId: string) {
    return this.bannerService.getOneBanner(bannerId);
  }

  @ApiOperation({ summary: 'Delete a banner by ID' })
  @ApiOkResponse({
    description: 'Banner deleted successfully',
    schema: { type: 'object', properties: { message: { type: 'string' } } },
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Banner not found',
  })
  @Delete(':bannerId')
  @CheckAbilities({
    action: ActionEnum.Delete,
    subject: SubjectEnum.Advertisement,
  })
  async deleteBanner(@Param('bannerId', ParseUUIDPipe) bannerId: string) {
    return this.bannerService.deleteBanner(bannerId);
  }
}
