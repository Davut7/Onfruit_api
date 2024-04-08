import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeEntity } from './entities/employee.entity';
import { PenaltyEntity } from './entities/penalty.entity';
import { PrePaymentEntity } from './entities/prepayment.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { MonthlyRecordEntity } from './entities/monthlyRecords.entity';
import { MonthlyRecordDetailEntity } from './entities/monthlyRecordDetails.entity';
import { MediaModule } from 'src/media/media.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EmployeeEntity,
      PenaltyEntity,
      PrePaymentEntity,
      MonthlyRecordEntity,
      MonthlyRecordDetailEntity,
    ]),
    ScheduleModule.forRoot(),
    MediaModule,
  ],
  controllers: [EmployeeController],
  providers: [EmployeeService],
})
export class EmployeeModule {}
