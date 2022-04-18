import {
  BadRequestException,
  ConflictException,
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
import { AuthCredentialsDto } from '../dto/auth-credential.dto';
import * as uuid from 'uuid';
import { EmailService } from './email.service';
import { Connection } from 'typeorm';
import { AlarmRepository } from 'src/repository/alarm.repository';
import { StudentRepository } from 'src/repository/student.repository';
// import { ClassService } from 'src/class/class.service';

const refreshConfig = config.get('refresh');
const kakaoConfig = config.get('kakao');
const googleConfig = config.get('google');

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    private jwtService: JwtService,
    @Inject(forwardRef(() => RefreshService))
    private userService: RefreshService,
    private emailService: EmailService,
    private connection: Connection,
    @InjectRepository(AlarmRepository)
    private alarmRepository: AlarmRepository,
    @InjectRepository(StudentRepository)
    private studentRepository: StudentRepository,
  ) {}

  async signUp(Dto: AuthCredentialsDto): Promise<object> {
    const user = await this.userRepository.findOne({
      email: Dto.email,
    });
    if (user) {
      if (user.provider !== null) {
        throw new BadRequestException(
          `${user.provider}로 이메일이 사용된적있어요`,
        );
      }
    }

    if (Dto.password !== Dto.confirmPassword) {
      throw new BadRequestException('비밀번호와 비밀번호확인이 다릅니다');
    }
    const signupVerifyToken = uuid.v4();
    await this.sendMemberJoinEmail(Dto.email, signupVerifyToken);
    if (user) {
      if (user.provider === null) {
        return {
          success: true,
          message: '새로운 이메일인증을 해주세요',
        };
      }
    }
    this.userRepository.createUser(
      Dto.email,
      Dto.name,
      null,
      Dto.password,
      signupVerifyToken,
    );
    return { success: true, message: '이메일인증을 해주세요' };
  }

  async findPassword(Dto) {
    const { email } = Dto;
    const user = await this.userRepository.findOne({ email });
    if (!user) {
      throw new BadRequestException('이메일정보가 정확하지않습니다.');
    }
    if (user.provider === null) {
      throw new BadRequestException('이메일 인증을 진행해주세요.');
    }
    if (user.provider !== 'local') {
      throw new BadRequestException(`${user.provider}로 로그인해주세요`);
    }
    const tempUUID = uuid.v4();
    const tempPassword = tempUUID.split('-')[0];
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(tempPassword, salt);
    const id = user.id;
    // const queryRunner = this.connection.createQueryRunner();
    // await queryRunner.connect();
    // await queryRunner.startTransaction();
    try {
      await this.userRepository.update(id, { password: hashedPassword });
      await this.emailService.sendTempPassword(email, tempPassword);
    } catch (e) {
      // await queryRunner.rollbackTransaction();
      throw new ConflictException({
        message: '비밀번호 찾기오류 다시시도해주세요',
      });
    } finally {
      // await queryRunner.release();
      return { success: true, message: '이메일에서 확인해주세요' };
    }
  }

  private async sendMemberJoinEmail(email: string, signupVerifyToken: string) {
    await this.emailService.sendMemberJoinVerification(
      email,
      signupVerifyToken,
    );
  }

  async verifyEmail(signupVerifyToken: string) {
    const user = await this.userRepository.findOne({
      currentHashedRefreshToken: signupVerifyToken,
    });
    if (!user) {
      return;
    }
    const id = user.id;
    const refreshToken = await this.makeRefreshToken(user.email);
    const accessToken = await this.makeAccessToken(user.email);

    await this.userRepository.update(id, { provider: 'local' });
    await this.userService.CurrnetRefreshToken(refreshToken, id);

    return { accessToken, refreshToken };
  }

  async signIn(Dto): Promise<object> {
    const { email, password } = Dto;
    const user = await this.userRepository.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      if (user.provider === null) {
        throw new BadRequestException('이메일 인증을 진행해주세요');
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

  async checkAlarm(user) {
    return await this.alarmRepository.find({ user });
  }

  async deleteAlarm(user, alarmid) {
    const result = await this.alarmRepository.delete({ user, id: alarmid });
    if (result.affected === 0) {
      throw new NotFoundException('알림 삭제 실패');
    }
    return { success: true, message: '알림삭제성공' };
  }

  async deleteAllAlarm(user) {
    const result = await this.alarmRepository.delete({ user });
    if (result.affected === 0) {
      throw new NotFoundException('알림 삭제 실패');
    }
    return { success: true, message: '알림삭제성공' };
  }

  async kakaoSignin() {
    const data = {
      KAKAO_ID: kakaoConfig.client_id,
      KAKAO_REDIRECT_URI: kakaoConfig.redirect_uri,
      // KAKAO_REDIRECT_URI: 'http://localhost:3000/user/kakao/callback',
    };
    return data;
  }

  async googleSignin() {
    const data = {
      GOOGLE_ID: googleConfig.client_id,
      GOOGLE_REDIRECT_URI: googleConfig.redirect_uri,
      // GOOGLE_REDIRECT_URI: 'http://localhost:3000/user/google/callback',
    };
    return data;
  }
  // async googleCallback(query) {
  //   const data = {
  //     code: query,
  //     grant_type: 'authorization_code',
  //     client_id: googleConfig.client_id,
  //     redirect_uri: googleConfig.redirect_uri,
  //     client_secret: googleConfig.client_secret,
  //     Scopes: 'https://www.googleapis.com/auth/userinfo.email',
  //   };

  //   const queryStringBody = Object.keys(data)
  //     .map((k) => encodeURIComponent(k) + '=' + encodeURI(data[k]))
  //     .join('&');
  //   const config: AxiosRequestConfig = {
  //     headers: {
  //       'Content-Type': 'application/x-www-form-urlencoded',
  //     },
  //   };
  //   const response = await axios.post(
  //     'https://www.googleapis.com/oauth2/v4/token',
  //     queryStringBody,
  //     config,
  //   );
  //   const { access_token } = response.data;
  //   const getUserUrl = 'https://www.googleapis.com/oauth2/v2/userinfo';
  //   const response2 = await axios({
  //     method: 'get',
  //     url: getUserUrl,
  //     headers: {
  //       Authorization: `Bearer ${access_token}`,
  //       accept: 'application/json',
  //     },
  //   });
  //   const userdata = response2.data;
  //   const email = userdata.email;
  //   const name = userdata.name;
  //   const user = await this.userRepository.findOne({
  //     email,
  //   });
  //   const accessToken = await this.makeAccessToken(email);
  //   const refreshToken = await this.makeRefreshToken(email);
  //   if (user) {
  //     await this.userService.CurrnetRefreshToken(refreshToken, user['id']);
  //     return {
  //       accessToken,
  //       refreshToken,
  //     };
  //   } else {
  //     const newUser = await this.userRepository.createUser(
  //       email,
  //       name,
  //       'google',
  //     );
  //     await this.userService.CurrnetRefreshToken(refreshToken, newUser);
  //     return {
  //       accessToken,
  //       refreshToken,
  //     };
  //   }
  // }

  // async kakaoCallback(query) {
  //   const data = {
  //     code: query,
  //     grant_type: 'authorization_code',
  //     client_id: kakaoConfig.client_id,
  //     redirect_uri: kakaoConfig.redirect_uri,
  //     client_secret: kakaoConfig.client_secret,
  //   };

  //   const queryStringBody = Object.keys(data)
  //     .map((k) => encodeURIComponent(k) + '=' + encodeURI(data[k]))
  //     .join('&');
  //   const config: AxiosRequestConfig = {
  //     headers: {
  //       'Content-Type': 'application/x-www-form-urlencoded',
  //     },
  //   };
  //   const response = await axios.post(
  //     'https://kauth.kakao.com/oauth/token',
  //     queryStringBody,
  //     config,
  //   );
  //   const { access_token } = response.data;
  //   const getUserUrl = 'https://kapi.kakao.com/v2/user/me';
  //   const response2 = await axios({
  //     method: 'get',
  //     url: getUserUrl,
  //     headers: {
  //       Authorization: `Bearer ${access_token}`,
  //     },
  //   });
  //   const userdata = response2.data;
  //   const email = userdata.kakao_account.email;
  //   const name = userdata.properties.nickname;
  //   const user = await this.userRepository.findOne({
  //     email,
  //   });
  //   const accessToken = await this.makeAccessToken(email);
  //   const refreshToken = await this.makeRefreshToken(email);
  //   if (user) {
  //     await this.userService.CurrnetRefreshToken(refreshToken, user['id']);
  //     return {
  //       accessToken,
  //       refreshToken,
  //     };
  //   } else {
  //     const newUser = await this.userRepository.createUser(
  //       email,
  //       name,
  //       'kakao',
  //     );
  //     await this.userService.CurrnetRefreshToken(refreshToken, newUser);
  //     return {
  //       accessToken,
  //       refreshToken,
  //     };
  //   }
  // }

  async callback(query, provider) {
    let data;
    let getUserUrl;
    let tokenUrl;
    if (provider === 'google') {
      data = {
        code: query,
        grant_type: 'authorization_code',
        client_id: googleConfig.client_id,
        redirect_uri: googleConfig.redirect_uri,
        // redirect_uri: 'http://localhost:3000/user/google/callback',
        client_secret: googleConfig.client_secret,
        Scopes: 'https://www.googleapis.com/auth/userinfo.email',
      };
      tokenUrl = 'https://www.googleapis.com/oauth2/v4/token';
      getUserUrl = 'https://www.googleapis.com/oauth2/v2/userinfo';
    }
    if (provider === 'kakao') {
      data = {
        code: query,
        grant_type: 'authorization_code',
        client_id: kakaoConfig.client_id,
        redirect_uri: kakaoConfig.redirect_uri,
        // redirect_uri: 'http://localhost:3000/user/kakao/callback',
        client_secret: kakaoConfig.client_secret,
      };
      tokenUrl = 'https://kauth.kakao.com/oauth/token';
      getUserUrl = 'https://kapi.kakao.com/v2/user/me';
    }
    const queryStringBody = Object.keys(data)
      .map((k) => encodeURIComponent(k) + '=' + encodeURI(data[k]))
      .join('&');
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };

    const response = await axios.post(tokenUrl, queryStringBody, config);
    const { access_token } = response.data;
    const response2 = await axios({
      method: 'get',
      url: getUserUrl,
      headers: {
        Authorization: `Bearer ${access_token}`,
        accept: 'application/json',
      },
    });
    const userdata = response2.data;
    let email;
    let name;
    if (provider === 'google') {
      email = userdata.email;
      name = userdata.name;
    }
    if (provider === 'kakao') {
      email = userdata.kakao_account.email;
      name = userdata.properties.nickname;
    }

    const user = await this.userRepository.findOne({
      email,
    });
    const accessToken = await this.makeAccessToken(email);
    const refreshToken = await this.makeRefreshToken(email);
    if (user) {
      await this.userService.CurrnetRefreshToken(refreshToken, user['id']);
      return {
        accessToken,
        refreshToken,
      };
    } else {
      const newUser = await this.userRepository.createUser(
        email,
        name,
        provider,
      );
      await this.userService.CurrnetRefreshToken(refreshToken, newUser);
      return {
        accessToken,
        refreshToken,
      };
    }
  }
}
