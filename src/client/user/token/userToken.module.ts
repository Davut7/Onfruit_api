import { Module } from '@nestjs/common';
import { UserTokenService } from './userToken.service';
import { UserTokenEntity } from './entities/userToken.entity';
import { UserEntity } from '../users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([UserTokenEntity, UserEntity])],
  providers: [UserTokenService],
  exports: [UserTokenService],
})
export class TokenModule {}
