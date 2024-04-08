import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateAddressDto } from './dto/updateAddress.dto';
import { ClientAddressEntity } from './entities/address.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientReadyAddressEntity } from './entities/readyAddresses.entity';
import { GetReadyAddressesDto } from './dto/getReadyAddress.dto';
import { CreateAddressDto } from './dto/createAddressDto.dto';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(ClientAddressEntity)
    private addressRepository: Repository<ClientAddressEntity>,
    @InjectRepository(ClientReadyAddressEntity)
    private readyAddressesRepository: Repository<ClientReadyAddressEntity>,
  ) {}

  async createAddress(dto: CreateAddressDto) {
    const candidate = await this.addressRepository.findOne({
      where: { title: dto.title },
    });
    if (candidate)
      throw new BadRequestException(`Address with this name already exists!`);
    const address = this.addressRepository.create(dto);
    await this.addressRepository.save(address);
    return address;
  }

  async deleteAddress(addressId: string, userId: string) {
    const address = await this.addressRepository.delete({
      id: addressId,
      userId: userId,
    });
    return {
      address,
      message: 'Address deleted successfully!',
    };
  }

  async getAddresses(userId: string) {
    const addresses = await this.addressRepository.find({
      where: { userId: userId },
    });
    return addresses;
  }

  async updateAddress(dto: UpdateAddressDto, addressId: string) {
    const address = await this.addressRepository.findOne({
      where: { id: addressId },
    });

    if (!address) throw new NotFoundException('Address not found');

    Object.assign(address, dto);

    await this.addressRepository.save(address);

    return address;
  }

  async getReadyAddresses(query: GetReadyAddressesDto) {
    const { search = '', lng = 'ru' } = query;

    const readyAddresses = await this.readyAddressesRepository
      .createQueryBuilder('readyAddresses')
      .select(['readyAddresses.id', `readyAddresses.${lng}Address`])
      .where(`readyAddresses.${lng}Address LIKE :search`, {
        search: `%${search}%`,
      })
      .getMany();
    return readyAddresses;
  }
}
