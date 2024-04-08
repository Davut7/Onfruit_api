import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AbilityFactory } from '../../admin/abilityControl/abilityControl.factory';
import {
  CHECK_ABILITY,
  RequiredRule,
} from '../common/decorators/abilityDecorator.decorator';
import { ForbiddenError } from '@casl/ability';
import { AdminTokenService } from 'src/admin/systemUsers/token/token.service';
import { AdminUsersService } from 'src/admin/systemUsers/user/users.service';
import { AdminTokenDto } from 'src/admin/systemUsers/token/dto/adminToken.dto';

@Injectable()
export class AbilitiesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: AbilityFactory,
    private AdminUserTokenService: AdminTokenService,
    private adminUsersService: AdminUsersService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rules =
      this.reflector.get<RequiredRule[]>(CHECK_ABILITY, context.getHandler()) ||
      [];
    const req = context.switchToHttp().getRequest();
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader)
        throw new UnauthorizedException({ message: 'User not authorized' });
      const bearer = authHeader.split(' ')[0];
      const token = authHeader.split(' ')[1];
      if (bearer !== 'Bearer' || !token) {
        throw new UnauthorizedException({ message: 'User not authorized' });
      }
      const user = this.AdminUserTokenService.validateAccessToken(
        token,
      ) as AdminTokenDto;
      const checkUser = await this.adminUsersService.getMe(user.id);

      const ability = this.caslAbilityFactory.createForUser(checkUser);
      rules.every((rule) =>
        ForbiddenError.from(ability).throwUnlessCan(rule.action, rule.subject),
      );
      req.currentUser = user;

      return true;
    } catch (err) {
      if (err instanceof ForbiddenError) {
        throw new ForbiddenException(
          'You do not have permission to perform this action',
        );
      }
      if (err instanceof UnauthorizedException) {
        throw new UnauthorizedException({ message: 'User not authorized' });
      }
    }
  }
}
