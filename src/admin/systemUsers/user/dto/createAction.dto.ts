import { PickType } from '@nestjs/swagger';
import { ActionEntity } from '../entities/adminActions.entity';

export class CreateActionDto extends PickType(ActionEntity, [
  'subjectId',
  'action',
] as const) {}
