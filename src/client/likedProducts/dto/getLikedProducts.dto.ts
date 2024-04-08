import { PickType } from '@nestjs/swagger';
import { PageOptionsDto } from 'src/helpers/common/dto/page.dto';

export class GetLikedProductsDto extends PickType(PageOptionsDto, [
  'page',
  'take',
  'lng',
  'commodity',
] as const) {}
