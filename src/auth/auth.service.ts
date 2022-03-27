import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
<<<<<<< HEAD
import { UserRepository } from './user.repository';
=======
import { UserRepository } from '../repository/user.repository';
>>>>>>> 709a134491bdcfc6d407646ffecf7c4b81d6104e
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import axios, { AxiosRequestConfig } from 'axios';
import * as config from 'config';
import { RefreshService } from './refresh.service';
import { AuthCredentialsDto } from './dto/auth-credential.dto';
import * as uuid from 'uuid';
import { EmailService } from './email.service';

const refreshConfig = config.get('refresh');
const kakaoConfig = config.get('kakao');

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    private jwtService: JwtService,
    @Inject(forwardRef(() => RefreshService))
    private userService: RefreshService,
    private emailService: EmailService,
  ) {}

  async signUp(Dto: AuthCredentialsDto): Promise<object> {
    const user = await this.userRepository.findOne({
      userEmail: Dto.userEmail,
    });
    if (user) {
      throw new BadRequestException(
        `${user.provider}로 이미 이메일이 사용된적있어요`,
      );
    }
    if (Dto.password !== Dto.confirmPassword) {
      throw new BadRequestException('비밀번호와 비밀번호확인이 다릅니다');
    }
<<<<<<< HEAD
    const signupVerifyToken = uuid.v1();
=======
    const signupVerifyToken = uuid.v4();
>>>>>>> 709a134491bdcfc6d407646ffecf7c4b81d6104e
    await this.sendMemberJoinEmail(Dto.userEmail, signupVerifyToken);

    this.userRepository.createUser(
      Dto.userEmail,
      Dto.nickname,
      null,
      Dto.password,
      signupVerifyToken,
    );
    return { success: true, message: '이메일인증을 해주세요' };
  }

  private async sendMemberJoinEmail(email: string, signupVerifyToken: string) {
    await this.emailService.sendMemberJoinVerification(
      email,
      signupVerifyToken,
    );
  }

  async verifyEmail(signupVerifyToken: string): Promise<object> {
    const user = await this.userRepository.findOne({
      currentHashedRefreshToken: signupVerifyToken,
    });
    if (!user) {
      return;
    }
    const id = user.id;
    const refreshToken = await this.makeRefreshToken(user.userEmail);
    await this.userRepository.update(id, { provider: 'local' });
    await this.userService.CurrnetRefreshToken(refreshToken, id);
    return;
  }

  async signIn(Dto): Promise<object> {
    const { userEmail, password } = Dto;
    const user = await this.userRepository.findOne({ userEmail });

    if (user && (await bcrypt.compare(password, user.password))) {
      if (user.provider === null) {
        throw new BadRequestException('이메일 인증을 확인해주세요');
      }
      const accessToken = await this.makeAccessToken(user.userEmail);
      const refreshToken = await this.makeRefreshToken(user.userEmail);
      const id = user.id;
      await this.userService.CurrnetRefreshToken(refreshToken, id);
      return {
        accessToken,
        refreshToken,
<<<<<<< HEAD
        nickname: user.username,
=======
        nickname: user.userName,
>>>>>>> 709a134491bdcfc6d407646ffecf7c4b81d6104e
        success: true,
        message: '로그인성공',
      };
    } else {
      throw new UnauthorizedException('유저정보가 정확하지않습니다.');
    }
  }

  async deleteUser(user) {
    const result = await this.userRepository.delete({ id: user.id });
    if (result.affected === 0) {
      throw new NotFoundException('회원 탈퇴 실패!!!');
    }
    return { success: true, message: '잘가세요..' };
  }

  async makeAccessToken(userEmail) {
    const payload = { userEmail };
    const accessToken = await this.jwtService.sign(payload);
    return accessToken;
  }
  async makeRefreshToken(userEmail) {
    const payload = { userEmail };
    const refreshToken = await this.jwtService.sign(payload, {
      secret: refreshConfig.secret,
      expiresIn: '15d',
    });
    return refreshToken;
  }

<<<<<<< HEAD
  async modifyUsername(username: string, id) {
    await this.userRepository.update(id, { username });
=======
  async modifyUsername(userName: string, id) {
    await this.userRepository.update(id, { userName });
>>>>>>> 709a134491bdcfc6d407646ffecf7c4b81d6104e
  }

  async modifyPassword(Dto, id) {
    if (Dto.password !== Dto.confirmPassword) {
      throw new BadRequestException('비밀번호와 비밀번호확인이 다릅니다');
    }
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(Dto.password, salt);
    await this.userRepository.update(id, { password: hashedPassword });
  }

<<<<<<< HEAD
=======
  async changOneword(id, Dto) {
    const { oneword } = Dto;
    await this.userRepository.update(id, { oneword });
    return { success: true, message: '한줄 다짐 변경 성공' };
  }

>>>>>>> 709a134491bdcfc6d407646ffecf7c4b81d6104e
  async kakaoSignin(query) {
    const data = {
      code: query,
      grant_type: 'authorization_code',
      client_id: kakaoConfig.client_id,
      redirect_uri: kakaoConfig.redirect_uri,
      client_secret: kakaoConfig.client_secret,
    };
    const queryStringBody = Object.keys(data)
      .map((k) => encodeURIComponent(k) + '=' + encodeURI(data[k]))
      .join('&');
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };
    const response = await axios.post(
      'https://kauth.kakao.com/oauth/token',
      queryStringBody,
      config,
    );
    const { access_token } = response.data;
    // const access_token = query;
    const getUserUrl = 'https://kapi.kakao.com/v2/user/me';
    const response2 = await axios({
      method: 'get',
      url: getUserUrl,
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    const userdata = response2.data;
    // const userEmail = 'whtkdgusdldi@naver.com';
    const userEmail = userdata.kakao_account.email;
<<<<<<< HEAD
    const username = userdata.properties.nickname;
=======
    const userName = userdata.properties.nickname;
>>>>>>> 709a134491bdcfc6d407646ffecf7c4b81d6104e
    const user = await this.userRepository.findOne({
      userEmail,
    });
    const accessToken = await this.makeAccessToken(userEmail);
    const refreshToken = await this.makeRefreshToken(userEmail);
    if (user) {
      this.userService.CurrnetRefreshToken(refreshToken, user['id']);
      return {
        success: true,
        accessToken,
        refreshToken,
<<<<<<< HEAD
        nickname: user['username'],
=======
        nickname: user['userName'],
>>>>>>> 709a134491bdcfc6d407646ffecf7c4b81d6104e
        message: '카카오 로그인 성공',
      };
    } else {
      const newUser = await this.userRepository.createUser(
        userEmail,
<<<<<<< HEAD
        username,
=======
        userName,
>>>>>>> 709a134491bdcfc6d407646ffecf7c4b81d6104e
        'kakao',
      );
      this.userService.CurrnetRefreshToken(refreshToken, newUser);
      return {
        success: true,
        accessToken,
        refreshToken,
        message: '카카오 인증 및 로그인 성공',
      };
    }
  }
}
