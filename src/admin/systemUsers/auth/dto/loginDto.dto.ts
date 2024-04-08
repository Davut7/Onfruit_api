import { PickType } from '@nestjs/swagger';
import { AdminsEntity } from '../../user/entities/adminUsers.entity';

export class AdminUserLoginDto extends PickType(AdminsEntity, [
  'name',
  'password',
] as const) {}
