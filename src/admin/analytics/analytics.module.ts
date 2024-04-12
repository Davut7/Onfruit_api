import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from 'src/client/order/entities/order.entity';
import { UserEntity } from 'src/client/user/users/entities/user.entity';
import { AbilityControlModule } from '../abilityControl/abilityControl.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity, UserEntity]),
    AbilityControlModule,
    RedisModule,
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
