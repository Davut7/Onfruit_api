import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/helpers/common/decorators/requiredRoles.decorator';
import { UserTokenService } from '../../client/user/token/userToken.service';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private tokenService: UserTokenService,
    private reflector: Reflector,
    private redisService: RedisService,
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

    const isInBlackList = await this.redisService.getAccessToken(token);
    if (isInBlackList) {
      throw new UnauthorizedException({ message: 'User not authorized' });
    }

    if (!userToken) {
      throw new UnauthorizedException({ message: 'User not authorized' });
    }

    req.currentUser = userToken;
    return true;
  }
}
