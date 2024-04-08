import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from 'src/helpers/baseEntity.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { MonthlyRecordEntity } from './monthlyRecords.entity';

@Entity({ name: 'monthly_record_details' })
export class MonthlyRecordDetailEntity extends BaseEntity {
  @ApiProperty({
    description: 'Salary for the monthly record detail',
    type: Number,
    example: 50000,
  })
  @Column({ type: 'float', nullable: false })
  salary: number;

  @ApiProperty({
    description: 'Penalty for the monthly record detail',
    type: Number,
    example: 1000,
    default: 0,
  })
  @Column({ type: 'float', nullable: false, default: 0 })
  penalty: number;

  @ApiProperty({
    description: 'Prepayment for the monthly record detail',
    type: Number,
    example: 2000,
    default: 0,
  })
  @Column({ type: 'float', nullable: false, default: 0 })
  prepayment: number;

  @ApiProperty({
    description: 'ID of the monthly record associated with the detail',
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid' })
  monthlyRecordId: string;

  @ApiProperty({
    description: 'Monthly record associated with the detail',
    type: () => MonthlyRecordEntity,
  })
  @ManyToOne(
    () => MonthlyRecordEntity,
    (monthlyRecord) => monthlyRecord.details,
    {
      onDelete: 'CASCADE',
    },
  )
  monthlyRecord: MonthlyRecordEntity;
}
