import {
  Controller,
  Post,
  Param,
  Body,
  Delete,
  Patch,
  UseGuards,
  ParseUUIDPipe,
  Get,
  Query,
} from '@nestjs/common';
import { UpdateAddressDto } from './dto/updateAddress.dto';
import { ClientAuthGuard } from 'src/helpers/guards/clientAuthGuard.guard';
import { AddressService } from './address.service';
import { UserEntity } from '../users/entities/user.entity';
import { CurrentUser } from 'src/helpers/common/decorators/currentUser.decorator';
import { GetReadyAddressesDto } from './dto/getReadyAddress.dto';
import { CreateAddressDto } from './dto/createAddressDto.dto';

@Controller('address')
export class AddressController {
  constructor(private addressService: AddressService) {}

  @Post('')
  @UseGuards(ClientAuthGuard)
  async addAddress(
    @CurrentUser() currentUser: UserEntity,
    @Body() dto: CreateAddressDto,
  ) {
    dto.userId = currentUser.id;
    return this.addressService.createAddress(dto);
  }
  @Get()
  @UseGuards(ClientAuthGuard)
  async getAllAddresses(@CurrentUser() currentUser: UserEntity) {
    return this.addressService.getAddresses(currentUser.id);
  }

  @Get('ready')
  @UseGuards(ClientAuthGuard)
  async getAllReadyAddresses(@Query() query: GetReadyAddressesDto) {
    return this.addressService.getReadyAddresses(query);
  }

  @Delete('/:id')
  @UseGuards(ClientAuthGuard)
  async deleteAddress(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return this.addressService.deleteAddress(id, currentUser.id);
  }

  @Patch('/:id')
  @UseGuards(ClientAuthGuard)
  async updateAddress(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addressService.updateAddress(dto, id);
  }
}
