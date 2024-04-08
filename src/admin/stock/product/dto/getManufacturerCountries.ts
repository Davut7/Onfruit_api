import { PickType } from '@nestjs/swagger';
import { PageOptionsDto } from 'src/helpers/common/dto/page.dto';

export class GetManufacturerCountries extends PickType(PageOptionsDto, [
  'lng',
  'search',
] as const) {}
