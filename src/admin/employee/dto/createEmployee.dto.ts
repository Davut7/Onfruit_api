import { OmitType } from '@nestjs/swagger';
import { EmployeeEntity } from '../entities/employee.entity';

export class CreateEmployeeDto extends OmitType(EmployeeEntity, [
  'createdAt',
  'deletedAt',
  'id',
  'updatedAt',
] as const) {}
