import { PickType } from '@nestjs/swagger';
import { SubjectEntity } from '../entities/adminSubjects.entity';

export class CreateSubjectDto extends PickType(SubjectEntity, [
  'adminId',
  'subject',
] as const) {}
