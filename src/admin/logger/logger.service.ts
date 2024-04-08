import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LogsEntity } from './entities/log.entity';
import { Repository } from 'typeorm';
import { CreateLogDto } from './dto/createLog.dto';
import { LogsOrderEnum, OrderType } from 'src/helpers/constants';
import { GetLogsFilter } from './dto/getLogs.dto';

@Injectable()
export class LoggerService {
  constructor(
    @InjectRepository(LogsEntity)
    private logsRepository: Repository<LogsEntity>,
  ) {}

  async createLog(log: CreateLogDto): Promise<LogsEntity> {
    const newLog = this.logsRepository.create(log);
    await this.logsRepository.save(newLog, { data: { isCreatingLogs: true } });
    return newLog;
  }

  async getLogs(query: GetLogsFilter) {
    const {
      page = 1,
      take = 10,
      orderBy = LogsOrderEnum.createdAt,
      order = OrderType.ASC,
    } = query;

    const logsQuery = this.logsRepository
      .createQueryBuilder('logs')
      .orderBy(`"${orderBy}"`, order)
      .take(take)
      .skip((page - 1) * take);
    if (query.level) {
      logsQuery.where('logs.level = :level', { level: query.level });
    }
    if (query.method) {
      logsQuery.where('logs.method = :method', { method: query.method });
    }
    const [logs, count] = await logsQuery.getManyAndCount();
    return {
      logs: logs,
      count: count,
      message: 'Logs returned successfully!',
    };
  }
}
