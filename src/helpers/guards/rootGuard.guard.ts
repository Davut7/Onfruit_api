import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AdminTokenDto } from 'src/admin/systemUsers/token/dto/adminToken.dto';
import { AdminTokenService } from 'src/admin/systemUsers/token/token.service';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class RootGuard implements CanActivate {
  constructor(
    private adminTokenService: AdminTokenService,
    private redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
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

      const userToken = this.adminTokenService.validateAccessToken(
        token,
      ) as AdminTokenDto;

      const isInBlackList = await this.redisService.getAccessToken(token);
      if (isInBlackList) {
        throw new UnauthorizedException({ message: 'User not authorized' });
      }
      if (userToken.role !== 'root') {
        throw new ForbiddenException();
      }
      req.currentUser = userToken;
      return true;
    } catch (e) {
      throw new UnauthorizedException({ message: 'User not authorized' });
    }
  }
}
