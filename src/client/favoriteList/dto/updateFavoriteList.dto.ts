import { PickType } from '@nestjs/swagger';
import { FavoriteListEntity } from '../entities/favoriteLists.entity';

export class UpdateFavoriteListDto extends PickType(FavoriteListEntity, [
  'title',
] as const) {}
