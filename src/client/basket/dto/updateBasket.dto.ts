import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsIn } from 'class-validator';
import { QuantityUpdate } from 'src/helpers/constants';

export class UpdateBasketProductDto {
  @ApiProperty({ type: 'integer', description: 'Product quantity type' })
  @IsEnum(QuantityUpdate)
  @IsInt()
  @IsIn([1, -1])
  quantityUpdate: QuantityUpdate;
}
