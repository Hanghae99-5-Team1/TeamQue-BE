import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { UserRepository } from './user.repository';

@Injectable()
export class RefreshService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
  ) {}
  async CurrnetRefreshToken(refreshToken: string, id: number) {
    const salt = await bcrypt.genSalt();
    const currentHashedRefreshToken = await bcrypt.hash(refreshToken, salt);
    await this.userRepository.update(id, { currentHashedRefreshToken });
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, userEmail: string) {
    const user = await this.userRepository.findOne({ userEmail });
    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.currentHashedRefreshToken,
    );

    if (isRefreshTokenMatching) {
      const accessToken = await this.authService.makeAccessToken(
        user.userEmail,
      );
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
