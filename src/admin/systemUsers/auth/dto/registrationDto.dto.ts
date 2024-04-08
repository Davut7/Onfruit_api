import { OmitType } from '@nestjs/swagger';
import { AdminsEntity } from '../../user/entities/adminUsers.entity';

export class AdminRegistrationUserDto extends OmitType(AdminsEntity, [
  'createdAt',
  'deletedAt',
  'id',
  'updatedAt',
  'token',
  'isActive',
] as const) {}
