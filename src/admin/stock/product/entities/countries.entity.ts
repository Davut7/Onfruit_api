import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { BaseEntity } from 'src/helpers/baseEntity.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'manufacturer_countries' })
export class ManufacturerCountriesEntity extends BaseEntity {
  @ApiProperty({
    title: 'Russian Country',
    name: 'ruCountry',
    description: 'The name of the country in Russian',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @Column({ type: 'varchar', nullable: false })
  ruCountry: string;

  @ApiProperty({
    title: 'Turkmen Country',
    name: 'tkmCountry',
    description: 'The name of the country in Turkmen',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @Column({ type: 'varchar', nullable: false })
  tkmCountry: string;

  @ApiProperty({
    title: 'English Country',
    name: 'enCountry',
    description: 'The name of the country in English',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @Column({ type: 'varchar', nullable: false })
  enCountry: string;
}
