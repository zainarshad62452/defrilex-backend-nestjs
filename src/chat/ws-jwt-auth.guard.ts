import { ExecutionContext, Injectable } from '@nestjs/common';
import { CustomJwtAuthGuard } from '../auth/jwt.guard';

@Injectable()
export class WsJwtGuard extends CustomJwtAuthGuard {
  getRequest(context: ExecutionContext) {
    const client = context.switchToWs().getClient();
    const { token } = client.handshake.auth;

    const mockRequest = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };

    return mockRequest;
  }
}
