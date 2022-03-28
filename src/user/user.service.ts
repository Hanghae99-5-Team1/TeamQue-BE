import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '../repository/user.repository';
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
export class UserService {
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
      email: Dto.email,
    });
    if (user) {
      throw new BadRequestException(
        `${user.provider}로 이미 이메일이 사용된적있어요`,
      );
    }
    if (Dto.password !== Dto.confirmPassword) {
      throw new BadRequestException('비밀번호와 비밀번호확인이 다릅니다');
    }
    const signupVerifyToken = uuid.v4();
    await this.sendMemberJoinEmail(Dto.email, signupVerifyToken);

    this.userRepository.createUser(
      Dto.email,
      Dto.name,
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
    const refreshToken = await this.makeRefreshToken(user.email);
    await this.userRepository.update(id, { provider: 'local' });
    await this.userService.CurrnetRefreshToken(refreshToken, id);
    return;
  }

  async signIn(Dto): Promise<object> {
    const { email, password } = Dto;
    const user = await this.userRepository.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      if (user.provider === null) {
        throw new BadRequestException('이메일 인증을 확인해주세요');
      }
      const accessToken = await this.makeAccessToken(user.email);
      const refreshToken = await this.makeRefreshToken(user.email);
      const id = user.id;
      await this.userService.CurrnetRefreshToken(refreshToken, id);
      return {
        accessToken,
        refreshToken,
        name: user.name,
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

  async makeAccessToken(email) {
    const payload = { email };
    const accessToken = await this.jwtService.sign(payload);
    return accessToken;
  }
  async makeRefreshToken(email) {
    const payload = { email };
    const refreshToken = await this.jwtService.sign(payload, {
      secret: refreshConfig.secret,
      expiresIn: '15d',
    });
    return refreshToken;
  }

  async editname(name: string, id) {
    await this.userRepository.update(id, { name });
  }

  async editPassword(Dto, id) {
    if (Dto.password !== Dto.confirmPassword) {
      throw new BadRequestException('비밀번호와 비밀번호확인이 다릅니다');
    }
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(Dto.password, salt);
    await this.userRepository.update(id, { password: hashedPassword });
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
    // const email = 'whtkdgusdldi@naver.com';
    const email = userdata.kakao_account.email;
    const name = userdata.properties.nickname;
    const user = await this.userRepository.findOne({
      email,
    });
    const accessToken = await this.makeAccessToken(email);
    const refreshToken = await this.makeRefreshToken(email);
    if (user) {
      this.userService.CurrnetRefreshToken(refreshToken, user['id']);
      return {
        success: true,
        accessToken,
        refreshToken,
        name: user['name'],
        message: '카카오 로그인 성공',
      };
    } else {
      const newUser = await this.userRepository.createUser(
        email,
        name,
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
