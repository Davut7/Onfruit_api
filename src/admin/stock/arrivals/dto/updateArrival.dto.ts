import { PartialType } from '@nestjs/swagger';
import { CreateArrivalDto } from './createArrival.dto';

export class UpdateArrivalDto extends PartialType(CreateArrivalDto) {}
