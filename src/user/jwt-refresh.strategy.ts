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
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userService: RefreshService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('refresh.secret'),
    });
  }

  async validate(payload) {
    console.log(payload);
    const { email } = payload;
    return email;
  }
}
