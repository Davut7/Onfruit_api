import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { RootGuard } from 'src/helpers/guards/rootGuard.guard';
import { GetLogsFilter } from './dto/getLogs.dto';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { LogsEntity } from './entities/log.entity';

@ApiTags('logs')
@ApiBearerAuth()
@Controller('/root/logs')
export class LoggerController {
  constructor(private readonly loggerService: LoggerService) {}

  @ApiOkResponse({
    description: 'App logs',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Logs returned successfully!' },
        count: { type: 'number' },
        logs: { items: { $ref: getSchemaPath(LogsEntity) } },
      },
    },
  })
  @Get()
  @UseGuards(RootGuard)
  getLogs(@Query() query: GetLogsFilter) {
    return this.loggerService.getLogs(query);
  }
}
