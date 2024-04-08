import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserEntity } from './entities/user.entity';
import { ClientAddressEntity } from '../address/entities/address.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageTransformer } from 'src/helpers/pipes/image.transform';
import { UserTokenEntity } from '../token/entities/userToken.entity';
import { TokenModule } from '../token/userToken.module';
import { MediaModule } from 'src/media/media.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      UserTokenEntity,
      ClientAddressEntity,
    ]),
    TokenModule,
    MediaModule,
  ],
  providers: [UserService, ImageTransformer],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
