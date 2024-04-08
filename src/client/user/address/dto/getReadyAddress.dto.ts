import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PageOptionsDto } from 'src/helpers/common/dto/page.dto';

export class GetReadyAddressesDto extends PickType(PageOptionsDto, ['lng']) {
  @ApiProperty({ name: 'search', required: false, type: 'string' })
  @IsOptional()
  @IsString()
  search: string;
}
