import { PickType } from '@nestjs/swagger';
import { PrePaymentEntity } from '../entities/prepayment.entity';

export class CreatePrepaymentDto extends PickType(PrePaymentEntity, [
  'prepaymentSum',
] as const) {}
