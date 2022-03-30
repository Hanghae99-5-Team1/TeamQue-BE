import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { UserService } from './user.service';
import { UserRepository } from '../repository/user.repository';

@Injectable()
export class RefreshService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}
  async CurrnetRefreshToken(refreshToken: string, id: number) {
    const salt = await bcrypt.genSalt();
    const currentHashedRefreshToken = await bcrypt.hash(refreshToken, salt);
    await this.userRepository.update(id, { currentHashedRefreshToken });
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, email) {
    const user = await this.userRepository.findOne({ email });
    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.currentHashedRefreshToken,
    );

    if (isRefreshTokenMatching) {
      const accessToken = await this.userService.makeAccessToken(user.email);
      return { success: true, accessToken, message: 'access토큰발행 성공' };
    }
  }

  async removeRefreshToken(id: number) {
    this.userRepository.update(id, {
      currentHashedRefreshToken: null,
    });
    return { success: true, message: '로그아웃 성공' };
  }
}
