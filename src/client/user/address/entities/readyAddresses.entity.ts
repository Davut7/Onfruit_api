import { BaseEntity } from 'src/helpers/baseEntity.entity';
import { Column, Entity } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'ready_addresses' })
export class ClientReadyAddressEntity extends BaseEntity {
  @ApiProperty({
    example: '123 Street, City',
    description: 'The address in Turkmen language',
    name: 'tkmAddress',
  })
  @Column({ type: 'varchar', nullable: false })
  tkmAddress: string;

  @ApiProperty({
    example: '123 Street, City',
    description: 'The address in Russian language',
    name: 'ruAddress',
  })
  @Column({ type: 'varchar', nullable: false })
  ruAddress: string;

  @ApiProperty({
    example: '123 Street, City',
    description: 'The address in English language',
    name: 'enAddress',
  })
  @Column({ type: 'varchar', nullable: false })
  enAddress: string;
}
