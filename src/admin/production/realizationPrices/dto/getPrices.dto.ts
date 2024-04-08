import { IsEnum, IsOptional } from 'class-validator';
import { UserRolesEnum } from 'src/helpers/constants';

export class GetPricesDto {
  @IsOptional()
  @IsEnum(UserRolesEnum)
  userType: UserRolesEnum;
}
