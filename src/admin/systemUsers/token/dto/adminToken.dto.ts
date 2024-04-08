import { AdminRoleEnum } from 'src/helpers/constants';
import { AdminsEntity } from '../../user/entities/adminUsers.entity';

export class AdminTokenDto {
  id: string;
  name: string;
  isActive: boolean;
  role: AdminRoleEnum;
  permissionFlag: number;

  constructor(user: AdminsEntity) {
    this.id = user.id;
    this.name = user.name;
    this.isActive = user.isActive;
    this.role = user.role;
  }
}
