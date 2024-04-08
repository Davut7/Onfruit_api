import { OmitType } from '@nestjs/swagger';
import { ClientAddressEntity } from '../entities/address.entity';

export class CreateAddressDto extends OmitType(ClientAddressEntity, [
  'id',
  'createdAt',
  'deletedAt',
  'updatedAt',
  'userId',
  'user',
] as const) {
  userId: string;
}
