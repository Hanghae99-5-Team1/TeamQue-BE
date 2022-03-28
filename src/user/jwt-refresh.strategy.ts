import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import * as config from 'config';
import { UserRepository } from '../repository/user.repository';
import { RefreshService } from './refresh.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('refresh.secret'),
    });
  }

  async validate(payload) {
    const { email } = payload;
    return email;
  }
}
