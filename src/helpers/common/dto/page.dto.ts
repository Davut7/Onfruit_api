import {
  IsEnum,
  IsInt,
  IsOptional,
  Min,
  IsString,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderType } from '../../constants/common/order';
import { LngEnum } from 'src/helpers/constants';
import { CommodityEnum } from 'src/helpers/constants/stock/products/commodity.enum';

export class PageOptionsDto {
  @IsEnum(OrderType)
  @IsOptional()
  @Type(() => String)
  readonly order: OrderType = OrderType.ASC;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  readonly page?: number;

  @IsInt()
  @Min(1)
  @IsIn([5, 10, 20, 50, 100])
  @IsOptional()
  @Type(() => Number)
  readonly take?: number;

  @IsString()
  @IsOptional()
  readonly search?: string;

  @IsOptional()
  @IsEnum(LngEnum)
  readonly lng: LngEnum;

  @IsEnum(CommodityEnum)
  @IsOptional()
  readonly commodity: CommodityEnum;
}
