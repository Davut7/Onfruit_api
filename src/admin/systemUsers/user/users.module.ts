import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminUsersController } from './users.controller';
import { AdminUsersService } from './users.service';
import { AdminsEntity } from './entities/adminUsers.entity';
import { SubjectEntity } from './entities/adminSubjects.Entity';
import { ActionEntity } from './entities/adminActions.Entity';
import { AdminTokenModule } from '../token/token.module';
import { AbilityControlModule } from 'src/admin/abilityControl/abilityControl.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminsEntity, SubjectEntity, ActionEntity]),
    AdminTokenModule,
    forwardRef(() => AbilityControlModule),
  ],
  controllers: [AdminUsersController],
  providers: [AdminUsersService],
  exports: [AdminUsersService],
})
export class AdminUsersModule {}
