import { ForbiddenException, Injectable } from '@nestjs/common';
import {
  Ability,
  AbilityBuilder,
  AbilityClass,
  InferSubjects,
} from '@casl/ability';
import { AdminsEntity } from '../systemUsers/user/entities/adminUsers.entity';
import { ActionEnum, SubjectEnum } from 'src/helpers/constants';

export type Subjects = InferSubjects<SubjectEnum | 'all'>;

export type AppAbility = Ability<[ActionEnum, Subjects]>;

@Injectable()
export class AbilityFactory {
  createForUser(user: AdminsEntity) {
    const { can, cannot, build } = new AbilityBuilder(
      Ability as AbilityClass<AppAbility>,
    );
    if (user.role === 'root') {
      Object.values(ActionEnum).forEach((action) => {
        Object.values(SubjectEnum).forEach((subject) => {
          can(action, subject);
        });
      });
    }
    if (user.subjects && user.subjects.length > 0) {
      user.subjects.forEach((subject) => {
        subject.action.forEach((action) => {
          const isAllowed = can(action.action, subject.subject);
          if (!isAllowed) throw new ForbiddenException();
        });
      });
    }
    return build();
  }
}
