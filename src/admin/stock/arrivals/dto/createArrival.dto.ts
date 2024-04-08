import { OmitType } from '@nestjs/swagger';
import { ArrivalEntity } from '../entities/arrival.entity';

export class CreateArrivalDto extends OmitType(ArrivalEntity, [
  'id',
] as const) {}
