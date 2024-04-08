import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserService } from '../../client/user/users/user.service';
import { ROLES_KEY } from 'src/helpers/common/decorators/requiredRoles.decorator';
import { UserTokenService } from '../../client/user/token/userToken.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private tokenService: UserTokenService,
    private reflector: Reflector,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;
    const bearer = authHeader.split(' ')[0];
    const token = authHeader.split(' ')[1];

    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException({ message: 'User not authorized' });
    }

    const userToken = this.tokenService.validateAccessToken(token);

    const user = await this.userService.getMe(token);

    if (!userToken || !user) {
      throw new UnauthorizedException({ message: 'User not authorized' });
    }

    req.currentUser = user;
    return true;
  }
}
