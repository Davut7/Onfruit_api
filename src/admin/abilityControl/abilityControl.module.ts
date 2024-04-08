import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubjectEntity } from '../systemUsers/user/entities/adminSubjects.entity';
import { ActionEntity } from '../systemUsers/user/entities/adminActions.entity';
import { AdminTokenModule } from '../systemUsers/token/token.module';
import { AdminUsersModule } from '../systemUsers/user/users.module';
import { AbilityFactory } from './abilityControl.factory';

@Module({
  imports: [
    TypeOrmModule.forFeature([SubjectEntity, ActionEntity]),
    AdminTokenModule,
    forwardRef(() => AdminUsersModule),
  ],
  providers: [AbilityFactory],
  exports: [AbilityFactory, AdminTokenModule, AdminUsersModule],
})
export class AbilityControlModule {}
