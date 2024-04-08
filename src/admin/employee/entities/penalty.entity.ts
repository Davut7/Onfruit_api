import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { BaseEntity } from 'src/helpers/baseEntity.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { MonthlyRecordEntity } from './monthlyRecords.entity';

@Entity({ name: 'employee_penalty' })
export class PenaltyEntity extends BaseEntity {
  @ApiProperty({
    title: 'Penalty Sum',
    name: 'penaltySum',
    description: 'The sum of penalty',
    type: Number,
    example: 100,
  })
  @IsNumber()
  @IsNotEmpty()
  @Column()
  penaltySum: number;

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
  @Column()
  monthlyRecordId: string;

  @ManyToOne(() => MonthlyRecordEntity, (employee) => employee.penalty, {
    onDelete: 'SET NULL',
  })
  monthlyRecord: MonthlyRecordEntity;
}
