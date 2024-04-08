import { UserRolesEnum } from 'src/helpers/constants';
import { UserEntity } from '../entities/user.entity';
import { PickType } from '@nestjs/swagger';

export class UserRegDto extends PickType(UserEntity, [
  'firstName',
  'lastName',
  'phoneNumber',
] as const) {
  role: UserRolesEnum;
}

export class UserUpdateDto extends PickType(UserEntity, [
  'firstName',
  'lastName',
] as const) {}

export class UserLoginDto extends PickType(UserEntity, [
  'phoneNumber',
] as const) {}
