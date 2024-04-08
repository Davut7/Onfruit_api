import { PickType } from '@nestjs/swagger';
import { SubjectEntity } from '../entities/adminSubjects.Entity';

export class CreateSubjectDto extends PickType(SubjectEntity, [
  'adminId',
  'subject',
] as const) {}
