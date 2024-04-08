import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { BaseEntity } from 'src/helpers/baseEntity.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { MonthlyRecordEntity } from './monthlyRecords.entity';

@Entity({ name: 'employee_prepayment' })
export class PrePaymentEntity extends BaseEntity {
  @ApiProperty({
    title: 'Prepayment Sum',
    name: 'prepaymentSum',
    description: 'The sum of prepayment',
    type: Number,
    example: 500,
  })
  @IsNumber()
  @IsNotEmpty()
  @Column({ type: 'float', nullable: false })
  prepaymentSum: number;

  @ApiProperty({
    title: 'Monthly Record ID',
    name: 'monthlyRecordId',
    description: 'The ID of the associated monthly record',
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  @Column({ type: 'uuid' })
  monthlyRecordId: string;

  @ManyToOne(() => MonthlyRecordEntity, (employee) => employee.prepayment, {
    onDelete: 'SET NULL',
  })
  monthlyRecord: MonthlyRecordEntity;
}
