import { PickType } from '@nestjs/swagger';
import { PageOptionsDto } from 'src/helpers/common/dto/page.dto';

export class GetOneClientProduct extends PickType(PageOptionsDto, [
  'lng',
] as const) {}
