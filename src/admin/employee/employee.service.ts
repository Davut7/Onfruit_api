import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateEmployeeDto } from './dto/createEmployee.dto';
import { UpdateEmployeeDto } from './dto/updateEmployee.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EmployeeEntity } from './entities/employee.entity';
import { DataSource, Repository, QueryRunner } from 'typeorm';
import { PenaltyEntity } from './entities/penalty.entity';
import { PrePaymentEntity } from './entities/prepayment.entity';
import { GetEmployeesQuery } from './dto/getEmployees.dto';
import { Cron } from '@nestjs/schedule';
import { MonthlyRecordEntity } from './entities/monthlyRecords.entity';
import { MonthlyRecordDetailEntity } from './entities/monthlyRecordDetails.entity';
import { CreatePenaltyDto } from './dto/createPenalty.dto';
import { CreatePrepaymentDto } from './dto/createPrepayment.dto';
import { MediaService } from 'src/media/media.service';

@Injectable()
export class EmployeeService {
  private readonly logger = new Logger(EmployeeService.name);
  constructor(
    @InjectRepository(EmployeeEntity)
    private employeeRepository: Repository<EmployeeEntity>,
    @InjectRepository(PrePaymentEntity)
    private monthlyRecordRepository: Repository<MonthlyRecordEntity>,
    private dataSource: DataSource,
    private mediaService: MediaService,
  ) {}
  async createEmployee(dto: CreateEmployeeDto) {
    const candidate = await this.employeeRepository.findOne({
      where: { passportSerial: dto.passportSerial },
    });
    if (candidate)
      throw new ConflictException(
        `Employee with this passport ${dto.passportSerial} already exists!`,
      );

    const employee = this.employeeRepository.create(dto);
    await this.employeeRepository.save(employee);
    return employee;
  }

  async getEmployees(query?: GetEmployeesQuery) {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const { search = '' } = query;
    const [employees, count] = await this.employeeRepository
      .createQueryBuilder('employees')
      .leftJoin('employees.monthlyRecords', 'monthlyRecords')
      .loadRelationCountAndMap(
        'monthlyRecords.penaltiesCount',
        'monthlyRecords.penalty',
      )
      .loadRelationCountAndMap(
        'monthlyRecords.prepaymentsCount',
        'monthlyRecords.prepayment',
      )
      .where(
        'employees.firstName ILIKE :search OR employees.lastName ILIKE :search',
        { search: `%${search}%` },
      )
      .andWhere(
        'monthlyRecords.month = :month AND monthlyRecords.year = :year',
        { month, year },
      )
      .getManyAndCount();
    return {
      message: 'Employees returned successfully',
      employees: employees,
      employeesCount: count,
    };
  }

  async getOneEmployee(employeeId: string) {
    const employee = await this.employeeRepository
      .createQueryBuilder('employees')
      .leftJoinAndSelect('employees.medias', 'medias')
      .leftJoinAndSelect('employees.monthlyRecords', 'monthlyRecords')
      .leftJoinAndSelect('monthlyRecords.penalty', 'penalty')
      .leftJoinAndSelect('monthlyRecords.prepayment', 'prepayments')
      .leftJoinAndSelect('monthlyRecords.details', 'details')
      .where('employees.id = :employeeId', { employeeId })
      .getOne();
    if (!employee) throw new NotFoundException('Employee not found');
    return employee;
  }

  async updateEmployee(employeeId: string, dto: UpdateEmployeeDto) {
    const employee = await this.getOneEmployee(employeeId);
    Object.assign(employee, dto);
    await this.employeeRepository.save(employee);
    return employee;
  }

  async deleteEmployee(employeeId: string) {
    let mediaIds = [];
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const employee = await this.getOneEmployee(employeeId);
      for (const media of employee.medias) {
        mediaIds.push(media.id);
      }
      await queryRunner.manager.delete(EmployeeEntity, employeeId);
      await this.mediaService.deleteMedias(mediaIds, queryRunner);
      await queryRunner.commitTransaction();
      return {
        message: 'Employee deleted successfully',
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        'Something went wrong while deleting employee',
      );
    } finally {
      await queryRunner.release();
    }
  }

  @Cron('0 0 1 * *')
  async createMonthlyRecords() {
    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      const employees = await this.employeeRepository.find();

      for (const employee of employees) {
        const existingRecord = await this.monthlyRecordRepository.findOne({
          where: { month, year, employee },
        });

        if (!existingRecord) {
          const monthlyRecord = new MonthlyRecordEntity();
          monthlyRecord.month = month;
          monthlyRecord.year = year;
          monthlyRecord.salary = employee.salary;
          monthlyRecord.employee = employee;
          await this.monthlyRecordRepository.save(monthlyRecord);
        }
      }

      console.log('Monthly records created successfully.');
    } catch (err) {
      console.error('Error creating monthly records:', err);
    }
  }

  async checkOrCreateMonthlyRecord(
    employeeId: string,
    queryRunner: QueryRunner,
  ) {
    const employee = await this.getOneEmployee(employeeId);

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    let monthlyRecord = await queryRunner.manager.findOne(MonthlyRecordEntity, {
      where: {
        month: month,
        year: year,
        employeeId: employeeId,
      },
    });
    if (!monthlyRecord) {
      monthlyRecord = queryRunner.manager.create(MonthlyRecordEntity, {
        month: month,
        year: year,
        salary: employee.salary,
        employee: employee,
      });

      await queryRunner.manager.save(monthlyRecord);
      console.log(`Monthly record created for employee ${employeeId}.`);
    }
  }

  async createPenalty(employeeId: string, dto: CreatePenaltyDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.checkOrCreateMonthlyRecord(employeeId, queryRunner);
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      await this.getOneEmployee(employeeId);

      const monthlyRecord = await queryRunner.manager.findOne(
        MonthlyRecordEntity,
        {
          where: { year: year, month: month },
        },
      );
      if (monthlyRecord.salary < dto.penaltySum)
        throw new ConflictException(
          'Monthly salary is not enough to pay penalty',
        );

      const penalty = queryRunner.manager.create(PenaltyEntity, {
        monthlyRecordId: monthlyRecord.id,
        ...dto,
      });

      await queryRunner.manager.save(penalty);

      const monthlyRecordDetail = queryRunner.manager.create(
        MonthlyRecordDetailEntity,
        {
          penalty: dto.penaltySum,
          salary: monthlyRecord.salary - dto.penaltySum,
          monthlyRecordId: monthlyRecord.id,
        },
      );
      monthlyRecord.salary = monthlyRecordDetail.salary;
      await queryRunner.manager.save(monthlyRecordDetail);
      await queryRunner.manager.save(monthlyRecord);
      await queryRunner.commitTransaction();
      return { message: 'Penalty created successfully', penalty: penalty };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(err);
    } finally {
      await queryRunner.release();
    }
  }

  async deletePenalty(penaltyId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const penalty = await queryRunner.manager.findOne(PenaltyEntity, {
        where: { id: penaltyId },
        relations: { monthlyRecord: true },
      });

      if (!penalty) {
        throw new NotFoundException(`Penalty with ID ${penaltyId} not found.`);
      }
      const monthlyRecord = await queryRunner.manager.findOne(
        MonthlyRecordEntity,
        { where: { id: penalty.monthlyRecordId } },
      );

      if (!monthlyRecord) {
        throw new NotFoundException(
          'Monthly record not found for the penalty.',
        );
      }

      const monthlyRecordDetail = await queryRunner.manager.findOne(
        MonthlyRecordDetailEntity,
        {
          where: { monthlyRecordId: penalty.monthlyRecordId },
        },
      );

      if (!monthlyRecordDetail)
        throw new NotFoundException(
          'Monthly record detail not found for the penalty.',
        );

      monthlyRecord.salary += penalty.penaltySum;
      await queryRunner.manager.save(monthlyRecord);

      await queryRunner.manager.delete(PenaltyEntity, penalty.id);

      await queryRunner.manager.delete(
        MonthlyRecordDetailEntity,
        monthlyRecordDetail.id,
      );

      await queryRunner.commitTransaction();
      return { message: 'Penalty deleted successfully.' };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(err);
    } finally {
      await queryRunner.release();
    }
  }

  async createPrepayment(employeeId: string, dto: CreatePrepaymentDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.checkOrCreateMonthlyRecord(employeeId, queryRunner);
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      await this.getOneEmployee(employeeId);

      const monthlyRecord = await queryRunner.manager.findOne(
        MonthlyRecordEntity,
        {
          where: { year: year, month: month },
        },
      );

      if (monthlyRecord.salary < dto.prepaymentSum)
        throw new ConflictException(
          'Monthly salary is not enough to pay penalty',
        );

      const prepayment = queryRunner.manager.create(PrePaymentEntity, {
        monthlyRecordId: monthlyRecord.id,
        ...dto,
      });

      await queryRunner.manager.save(prepayment);

      const monthlyRecordDetail = queryRunner.manager.create(
        MonthlyRecordDetailEntity,
        {
          prepayment: dto.prepaymentSum,
          salary: monthlyRecord.salary - dto.prepaymentSum,
          monthlyRecordId: monthlyRecord.id,
        },
      );

      monthlyRecord.salary = monthlyRecordDetail.salary;
      await queryRunner.manager.save(monthlyRecord);
      await queryRunner.manager.save(monthlyRecordDetail);
      await queryRunner.commitTransaction();
      return {
        message: 'Prepayment created successfully',
        prepayment: prepayment,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(err);
    } finally {
      await queryRunner.release();
    }
  }

  async deletePrepayment(prepaymentId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const prepayment = await queryRunner.manager.findOne(PrePaymentEntity, {
        where: { id: prepaymentId },
        relations: { monthlyRecord: true },
      });

      if (!prepayment) {
        throw new NotFoundException(
          `Prepayment with ID ${prepaymentId} not found.`,
        );
      }

      const monthlyRecordDetail = await queryRunner.manager.findOne(
        MonthlyRecordDetailEntity,
        {
          where: { monthlyRecordId: prepayment.monthlyRecordId },
        },
      );

      if (!monthlyRecordDetail) {
        throw new NotFoundException(
          'Monthly record detail not found for the penalty.',
        );
      }

      const monthlyRecord = await queryRunner.manager.findOne(
        MonthlyRecordEntity,
        { where: { id: prepayment.monthlyRecordId } },
      );

      if (!monthlyRecord) {
        throw new NotFoundException(
          'Monthly record not found for the penalty.',
        );
      }

      monthlyRecord.salary += prepayment.prepaymentSum;
      await queryRunner.manager.save(monthlyRecord);

      await queryRunner.manager.delete(PrePaymentEntity, prepayment.id);

      await queryRunner.manager.delete(
        MonthlyRecordDetailEntity,
        monthlyRecordDetail.id,
      );

      await queryRunner.commitTransaction();
      return { message: 'Prepayment deleted successfully.' };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(err);
    } finally {
      await queryRunner.release();
    }
  }

  async createEmployeeImage(employeeId: string, image: Express.Multer.File) {
    await this.getOneEmployee(employeeId);
    const media = await this.mediaService.createMedia(
      image,
      employeeId,
      'employeeId',
    );

    return {
      message: 'Employee image created successfully!',
      media: media,
    };
  }

  async deleteEmployeeImage(mediaId: string) {
    await this.mediaService.deleteOneMedia(mediaId);
    return {
      message: 'Employee image deleted successfully!',
    };
  }
}
