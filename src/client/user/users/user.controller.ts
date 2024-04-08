import {
  Controller,
  Get,
  Body,
  Patch,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ClientAuthGuard } from 'src/helpers/guards/clientAuthGuard.guard';
import { UserUpdateDto } from './dto/userDto.dto';
import { imageFilter } from 'src/helpers/filters/imageFilter';
import { diskStorage } from 'multer';
import { UserEntity } from './entities/user.entity';
import { DistributerUpdateDto } from './dto/distributerDto.dto';
import { CurrentUser } from 'src/helpers/common/decorators/currentUser.decorator';
import { randomUUID } from 'crypto';
import {
  ApiTags,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiBody,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
} from '@nestjs/swagger';

@ApiTags('client-users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('get-me')
  @UseGuards(ClientAuthGuard)
  @ApiOperation({ summary: 'Get current user details' })
  @ApiOkResponse({
    description: 'User details retrieved successfully.',
    type: UserEntity,
  })
  @ApiNotFoundResponse({ description: 'User not found.' })
  getMe(@CurrentUser() currentUser: UserEntity) {
    return this.userService.getMe(currentUser);
  }

  @Patch('user')
  @UseGuards(ClientAuthGuard)
  @ApiOperation({ summary: 'Update user information' })
  @ApiOkResponse({ description: 'User updated successfully.' })
  @ApiBadRequestResponse({ description: 'Bad request.' })
  @ApiBody({ type: UserUpdateDto })
  updateUser(
    @Body() dto: UserUpdateDto,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return this.userService.updateUser(currentUser, dto);
  }

  @Patch('distributer')
  @UseGuards(ClientAuthGuard)
  @ApiOperation({ summary: 'Update distributor information' })
  @ApiOkResponse({ description: 'Distributer updated successfully.' })
  @ApiBadRequestResponse({ description: 'Bad request.' })
  updateDistributer(
    @Body() dto: DistributerUpdateDto,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return this.userService.updateDistributer(currentUser, dto);
  }

  @Patch('/image')
  @UseGuards(ClientAuthGuard)
  @ApiOperation({ summary: 'Update user image' })
  @ApiCreatedResponse({ description: 'Image uploaded successfully.' })
  @ApiBadRequestResponse({ description: 'Bad request.' })
  @ApiConsumes('multipart/form-data')
  @ApiInternalServerErrorResponse({ description: 'Internal server error.' })
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
  updateUserImage(
    @UploadedFile() image: Express.Multer.File,
    @CurrentUser() currentUser: UserEntity,
  ) {
    if (!image) throw new BadRequestException('Please provide image');
    return this.userService.updateUserImage(currentUser, image);
  }

  @Delete()
  @UseGuards(ClientAuthGuard)
  @ApiOperation({ summary: 'Delete user account' })
  @ApiOkResponse({ description: 'User deleted successfully.' })
  @ApiBadRequestResponse({ description: 'Bad request.' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error.' })
  deleteAccount(@CurrentUser() currentUser: UserEntity) {
    return this.userService.deleteAccount(currentUser);
  }
}
