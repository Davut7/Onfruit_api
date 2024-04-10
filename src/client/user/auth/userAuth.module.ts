import { Module } from '@nestjs/common';
import { ClientAuthService } from './userAuth.service';
import { ClientAuthController } from './userAuth.controller';
import { UserEntity } from '../users/entities/user.entity';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserTokenEntity } from '../token/entities/userToken.entity';
import { TokenModule } from '../token/userToken.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserTokenEntity, UserEntity]),
    TokenModule,
    ThrottlerModule.forRoot([
      {
        name: 'test',
        ttl: 1 * 90 * 1000,
        limit: 1,
      },
      {
        name: '123',
        ttl: 10 * 90 * 1000,
        limit: 5,
      },
    ]),
    RedisModule,
  ],
  providers: [ClientAuthService],
  controllers: [ClientAuthController],
})
export class ClientAuthModule {}
