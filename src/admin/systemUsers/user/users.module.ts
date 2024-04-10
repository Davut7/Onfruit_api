import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminUsersController } from './users.controller';
import { AdminUsersService } from './users.service';
import { AdminsEntity } from './entities/adminUsers.entity';
import { SubjectEntity } from './entities/adminSubjects.entity';
import { ActionEntity } from './entities/adminActions.entity';
import { AdminTokenModule } from '../token/token.module';
import { AbilityControlModule } from 'src/admin/abilityControl/abilityControl.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminsEntity, SubjectEntity, ActionEntity]),
    AdminTokenModule,
    forwardRef(() => AbilityControlModule),
    RedisModule,
  ],
  controllers: [AdminUsersController],
  providers: [AdminUsersService],
  exports: [AdminUsersService],
})
export class AdminUsersModule {}
