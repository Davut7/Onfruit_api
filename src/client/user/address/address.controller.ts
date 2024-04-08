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
import {
  ApiBearerAuth,
  ApiTags,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { ClientAddressEntity } from './entities/address.entity';

@ApiTags('addresses')
@ApiBearerAuth()
@Controller('address')
export class AddressController {
  constructor(private addressService: AddressService) {}

  @Post('')
  @UseGuards(ClientAuthGuard)
  @ApiOperation({ summary: 'Add a new address' })
  @ApiCreatedResponse({
    description: 'Address added successfully.',
    type: ClientAddressEntity,
  })
  @ApiBadRequestResponse({ description: 'Bad request.' })
  @ApiConflictResponse({
    description: 'Address with the same name already exists.',
  })
  async addAddress(
    @CurrentUser() currentUser: UserEntity,
    @Body() dto: CreateAddressDto,
  ) {
    dto.userId = currentUser.id;
    return this.addressService.createAddress(dto);
  }

  @Get()
  @UseGuards(ClientAuthGuard)
  @ApiOperation({ summary: 'Get all addresses for the current user' })
  @ApiOkResponse({
    description: 'All addresses retrieved successfully.',
    type: [ClientAddressEntity],
  })
  async getAllAddresses(@CurrentUser() currentUser: UserEntity) {
    return this.addressService.getAddresses(currentUser.id);
  }

  @Get('ready')
  @UseGuards(ClientAuthGuard)
  @ApiOperation({ summary: 'Get all ready addresses' })
  @ApiOkResponse({
    description: 'All ready addresses retrieved successfully.',
    type: [ClientAddressEntity],
  })
  async getAllReadyAddresses(@Query() query: GetReadyAddressesDto) {
    return this.addressService.getReadyAddresses(query);
  }

  @Delete('/:addressId')
  @UseGuards(ClientAuthGuard)
  @ApiOperation({ summary: 'Delete an address by ID' })
  @ApiOkResponse({
    description: 'Address deleted successfully.',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Address deleted successfully' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Bad request.' })
  @ApiNotFoundResponse({ description: 'Address not found.' })
  async deleteAddress(@Param('addressId', ParseUUIDPipe) addressId: string) {
    return this.addressService.deleteAddress(addressId);
  }

  @Patch('/:addressId')
  @UseGuards(ClientAuthGuard)
  @ApiOperation({ summary: 'Update an address by ID' })
  @ApiOkResponse({
    description: 'Address updated successfully.',
    type: ClientAddressEntity,
  })
  @ApiBadRequestResponse({ description: 'Bad request.' })
  @ApiNotFoundResponse({ description: 'Address not found.' })
  async updateAddress(
    @Param('addressId', ParseUUIDPipe) addressId: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addressService.updateAddress(dto, addressId);
  }
}
