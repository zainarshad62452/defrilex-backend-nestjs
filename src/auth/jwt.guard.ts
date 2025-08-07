import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()  
export class CustomJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info, context: ExecutionContext) {
    if (err || !user) {
      const message =
        info?.message === 'No auth token'
          ? 'No token provided'
          : info?.message === 'jwt expired'
          ? 'Your session has expired. Please log in again.'
          : 'Invalid or malformed token';

      throw new UnauthorizedException(message);
    }
    return user;
  }
}
