import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import * as config from 'config';
<<<<<<< HEAD
import { UserRepository } from './user.repository';
=======
import { UserRepository } from '../repository/user.repository';
>>>>>>> 709a134491bdcfc6d407646ffecf7c4b81d6104e
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
    const { userEmail } = payload;
    return userEmail;
  }
}
