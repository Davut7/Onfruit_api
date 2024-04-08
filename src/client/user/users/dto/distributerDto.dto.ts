import { PartialType, PickType } from '@nestjs/swagger';
import { UserEntity } from '../entities/user.entity';
import { UserRolesEnum } from 'src/helpers/constants';

export class DistributerRegDto extends PickType(UserEntity, [
  'firstName',
  'lastName',
  'companyPhoneNumber',
  'companyType',
  'companyIp',
  'phoneNumber',
  'companyName',
]) {
  role: UserRolesEnum.DISTRIBUTER;
}

export class DistributerUpdateDto extends PartialType(DistributerRegDto) {}
