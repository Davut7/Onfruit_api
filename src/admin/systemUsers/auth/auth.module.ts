import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminAuthController } from './auth.controller';
import { AdminsEntity } from '../user/entities/adminUsers.entity';
import { AdminAuthService } from './auth.service';
import { AdminTokenModule } from '../token/token.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminsEntity]),
    AdminTokenModule,
    RedisModule,
  ],
  controllers: [AdminAuthController],
  providers: [AdminAuthService],
})
export class AdminAuthModule {}
