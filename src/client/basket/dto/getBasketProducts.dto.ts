import { PickType } from '@nestjs/swagger';
import { PageOptionsDto } from 'src/helpers/common/dto/page.dto';

export class GetBasketProducts extends PickType(PageOptionsDto, [
  'lng',
  'commodity',
] as const) {}
