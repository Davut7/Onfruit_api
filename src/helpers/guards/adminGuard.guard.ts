import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AdminTokenDto } from 'src/admin/systemUsers/token/dto/adminToken.dto';
import { AdminTokenService } from 'src/admin/systemUsers/token/token.service';
import { AdminUsersService } from 'src/admin/systemUsers/user/users.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private adminTokenService: AdminTokenService,
    private adminUserService: AdminUsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) throw new UnauthorizedException({ message: 'User not authorized' });
      const bearer = authHeader.split(' ')[0];
      const token = authHeader.split(' ')[1];

      if (bearer !== 'Bearer' || !token) {
        throw new UnauthorizedException({ message: 'User not authorized' });
      }

      const userToken = this.adminTokenService.validateAccessToken(
        token,
      ) as AdminTokenDto;

      const user = await this.adminUserService.getMe(userToken.id);

      req.currentUser = user;
      return true;
    } catch (e) {
      throw new UnauthorizedException({ message: 'User not authorized' });
    }
  }
}
