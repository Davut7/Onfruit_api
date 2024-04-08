import { PartialType } from '@nestjs/swagger';
import { CreateEmployeeDto } from './createEmployee.dto';

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {}
