import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { User } from 'src/entity/user.entity';
import { JwtStrategy } from 'src/auth/jwt.strategy';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtStrategy: JwtStrategy) {}

  async canActivate(context: ExecutionContext) {
    const data = context.switchToWs().getData();
    const authHeader = data.headers.authorization;
    const token = authHeader.split(' ')[1];
    const jwtPayload = jwt.verify(token, 'key');
    const user: User = await this.jwtStrategy.validate(jwtPayload);

    context.switchToWs().getData().user = user;
    return Boolean(user);
  }
}
