import { OmitType } from '@nestjs/swagger';
import { RealizationEntity } from '../entities/realizations.entity';

export class CreateRealizationDto extends OmitType(RealizationEntity, [
  'id',
  'deletedAt',
  'createdAt',
  'updatedAt',
  'productId',
  'isActive',
] as const) {}
