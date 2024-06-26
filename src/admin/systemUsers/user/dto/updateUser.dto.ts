import { PickType } from '@nestjs/swagger';
import { AdminsEntity } from '../entities/adminUsers.entity';

export class AdminUsersUpdateDto extends PickType(AdminsEntity, [
  'name',
  'password',
  'role',
  'isActive',
] as const) {}
