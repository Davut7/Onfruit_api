import { PartialType } from '@nestjs/swagger';
import { LogsEntity } from '../entities/log.entity';

export class CreateLogDto extends PartialType(LogsEntity) {}
