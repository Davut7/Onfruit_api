import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from 'src/helpers/baseEntity.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { IsNotEmpty, IsString, IsNumber, IsPhoneNumber } from 'class-validator';
import { IsDateFormat } from 'src/helpers/common/validators/validDateFormat.validator';
import { MonthlyRecordEntity } from './monthlyRecords.entity';
import { MediaEntity } from 'src/media/entities/media.entity';

@Entity({ name: 'employees' })
export class EmployeeEntity extends BaseEntity {
  @ApiProperty({
    title: 'First Name',
    name: 'firstName',
    description: 'First name of the employee',
    type: String,
  })
  @IsString()
  @Column()
  firstName: string;

  @ApiProperty({
    title: 'Last Name',
    name: 'lastName',
    description: 'Last name of the employee',
    type: String,
    example: 'Doe',
  })
  @IsString()
  @IsNotEmpty()
  @Column()
  lastName: string;

  @ApiProperty({
    title: 'Responsibility',
    name: 'responsibility',
    description: 'Responsibility of the employee',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @Column()
  responsibility: string;

  @ApiProperty({
    title: 'Salary',
    name: 'salary',
    description: 'Salary of the employee',
    type: Number,
    example: 50000,
  })
  @IsNumber()
  @IsNotEmpty()
  @Column()
  salary: number;

  @ApiProperty({
    title: 'Phone Number',
    name: 'phoneNumber',
    description: 'Phone number of the employee',
    type: String,
    example: '+998901234567',
  })
  @IsPhoneNumber('TM')
  @IsNotEmpty()
  @Column()
  phoneNumber: string;

  @ApiProperty({
    title: 'Passport Serial',
    name: 'passportSerial',
    description: 'Passport serial of the employee',
    type: String,
    example: 'AA1234567',
  })
  @IsNotEmpty()
  @Column()
  passportSerial: string;

  @ApiProperty({
    title: 'Hired Time',
    name: 'hiredTime',
    description: 'Date and time when the employee was hired',
    type: Date,
    example: '2022-03-31',
  })
  @IsNotEmpty()
  @IsDateFormat()
  @Column({ type: 'date', nullable: false })
  hiredTime: Date;

  @ApiProperty({
    title: 'Monthly Records',
    name: 'monthlyRecords',
    description: 'Monthly records of the employee',
    type: () => [MonthlyRecordEntity],
  })
  @OneToMany(
    () => MonthlyRecordEntity,
    (monthlyRecord) => monthlyRecord.employee,
  )
  monthlyRecords: MonthlyRecordEntity[];

  @ApiProperty({
    title: 'Medias',
    name: 'medias',
    description: 'Media associated with the employee',
    type: () => [MediaEntity],
  })
  @OneToMany(() => MediaEntity, (media) => media.employee)
  medias: MediaEntity[];
}
