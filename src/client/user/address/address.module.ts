import { Module } from '@nestjs/common';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';
import { ClientAddressEntity } from './entities/address.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { ClientReadyAddressEntity } from './entities/readyAddresses.entity';
import { UserModule } from '../users/user.module';
import { TokenModule } from '../token/userToken.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClientAddressEntity,
      UserEntity,
      ClientReadyAddressEntity,
    ]),
    TokenModule,
    UserModule,
    RedisModule,
  ],
  controllers: [AddressController],
  providers: [AddressService],
  exports: [AddressService],
})
export class ClientAddressModule {}
