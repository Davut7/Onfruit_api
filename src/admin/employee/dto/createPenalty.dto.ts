import { PickType } from '@nestjs/swagger';
import { PenaltyEntity } from '../entities/penalty.entity';

export class CreatePenaltyDto extends PickType(PenaltyEntity, [
  'penaltySum',
] as const) {}
