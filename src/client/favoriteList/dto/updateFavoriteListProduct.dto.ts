import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsIn, IsInt } from 'class-validator';
import { QuantityUpdate } from 'src/helpers/constants';

export class UpdateFavoriteListProductDto {
  @ApiProperty({ type: 'integer', description: 'Product quantity type' })
  @IsInt()
  @IsIn([1, -1])
  @IsEnum(QuantityUpdate)
  quantityUpdate: QuantityUpdate;
}
