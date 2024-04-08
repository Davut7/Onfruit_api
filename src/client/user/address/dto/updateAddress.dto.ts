import { PartialType } from '@nestjs/swagger';
import { CreateAddressDto } from './createAddressDto.dto';

export class UpdateAddressDto extends PartialType(CreateAddressDto) {}
