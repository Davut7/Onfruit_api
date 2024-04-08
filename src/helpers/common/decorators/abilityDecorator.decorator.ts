import { SetMetadata } from '@nestjs/common';
import { Subjects } from 'src/admin/abilityControl/abilityControl.factory';
import { ActionEnum } from 'src/helpers/constants';

export interface RequiredRule {
  action: ActionEnum;
  subject: Subjects;
}

export const CHECK_ABILITY = 'check_ability';

export const CheckAbilities = (...requirements: RequiredRule[]) =>
  SetMetadata(CHECK_ABILITY, requirements);
