import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from 'src/helpers/baseEntity.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { EmployeeEntity } from './employee.entity';
import { MonthlyRecordDetailEntity } from './monthlyRecordDetails.entity';
import { IsNotEmpty, IsString } from 'class-validator';
import { PrePaymentEntity } from './prepayment.entity';
import { PenaltyEntity } from './penalty.entity';

@Entity({ name: 'monthly_records' })
export class MonthlyRecordEntity extends BaseEntity {
  @ApiProperty({
    title: 'Month',
    name: 'month',
    description: 'Month of the monthly record',
    type: Number,
    example: 3,
  })
  @Column({ type: 'float', nullable: false })
  month: number;

  @ApiProperty({
    title: 'Year',
    name: 'year',
    description: 'Year of the monthly record',
    type: Number,
    example: 2022,
  })
  @Column({ type: 'float', nullable: false })
  year: number;

  @ApiProperty({
    title: 'Salary',
    name: 'salary',
    description: 'Salary of the monthly record',
    type: Number,
    example: 50000,
  })
  @Column()
  salary: number;

  @ApiProperty({
    title: 'Employee ID',
    name: 'employeeId',
    description: 'ID of the employee associated with the monthly record',
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  @Column({ type: 'uuid' })
  employeeId: string;

  @ManyToOne(() => EmployeeEntity, (employee) => employee.monthlyRecords, {
    onDelete: 'SET NULL',
  })
  employee: EmployeeEntity;

  @OneToMany(
    () => MonthlyRecordDetailEntity,
    (recordDetail) => recordDetail.monthlyRecord,
    { cascade: true },
  )
  details: MonthlyRecordDetailEntity[];

  @OneToMany(() => PenaltyEntity, (penalty) => penalty.monthlyRecord)
  penalty: PenaltyEntity[];

  @OneToMany(() => PrePaymentEntity, (prepayment) => prepayment.monthlyRecord)
  prepayment: PrePaymentEntity[];
}
