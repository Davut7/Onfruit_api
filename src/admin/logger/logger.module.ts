import { Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { LoggerController } from './logger.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogsEntity } from './entities/log.entity';
import { ConfigModule } from '@nestjs/config';
import CustomLogger from '../../helpers/log/customLogger';
import { AdminTokenModule } from '../systemUsers/token/token.module';
import { AdminUsersModule } from '../systemUsers/user/users.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([LogsEntity]),
    AdminTokenModule,
    AdminUsersModule,
    RedisModule,
  ],
  controllers: [LoggerController],
  providers: [LoggerService, CustomLogger],
  exports: [CustomLogger],
})
export class LoggerModule {}
