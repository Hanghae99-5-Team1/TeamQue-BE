import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
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
      return {
        statusCode: 400,
        message: 'This email has already been signed up.',
        provider: user.provider,
      };
    }
    const signupVerifyToken = uuid.v1();
    await this.sendMemberJoinEmail(Dto.userEmail, signupVerifyToken);

    this.userRepository.createUser(
      Dto.userEmail,
      Dto.nickname,
      null,
      Dto.password,
      signupVerifyToken,
    );
    return { message: '이메일인증을 해주세요' };
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
        return {
          statusCode: 400,
          message: '이메일 인증을 확인해주세요',
        };
      }
      const accessToken = await this.makeAccessToken(user.userEmail);
      const refreshToken = await this.makeRefreshToken(user.userEmail);
      const id = user.id;
      await this.userService.CurrnetRefreshToken(refreshToken, id);
      return { accessToken, refreshToken, nickname: user.username };
    } else {
      return {
        statusCode: 400,
        message: '로그인 실패',
      };
    }
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

  async modifyUsername(username: string, id) {
    await this.userRepository.update(id, { username });
    return { nickname: username };
  }

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
    const username = userdata.properties.nickname;
    const user = await this.userRepository.findOne({
      userEmail,
    });
    const accessToken = await this.makeAccessToken(userEmail);
    const refreshToken = await this.makeRefreshToken(userEmail);
    if (user) {
      this.userService.CurrnetRefreshToken(refreshToken, user['id']);
      return { accessToken, refreshToken, nickname: user['username'] };
    } else {
      const newUser = await this.userRepository.createUser(
        userEmail,
        username,
        'kakao',
      );
      this.userService.CurrnetRefreshToken(refreshToken, newUser);
      return { accessToken, refreshToken };
    }
  }
}
