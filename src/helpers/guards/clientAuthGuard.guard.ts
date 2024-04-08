import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserTokenService } from '../../client/user/token/userToken.service';

@Injectable()
export class ClientAuthGuard implements CanActivate {
  constructor(private tokenService: UserTokenService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    try {
      const authHeader = req.headers.authorization;
      const bearer = authHeader.split(' ')[0];
      const token = authHeader.split(' ')[1];
      if (bearer !== 'Bearer' || !token || null) {
        throw new UnauthorizedException({ message: 'User not authorized' });
      }
      const tokenData = this.tokenService.validateAccessToken(token);
      if (!tokenData)
        throw new UnauthorizedException({ message: 'User not authorized' });
      req.currentUser = tokenData;
      return true;
    } catch (e) {
      throw new UnauthorizedException({ message: 'User not authorized' });
    }
  }
}
