import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
// import { AuthCredentialsDto } from './dto/auth-credential.dto';
import { UserRepository } from './user.repository';
// import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import axios, { AxiosRequestConfig, AxiosRequestHeaders } from 'axios';
import qs from 'qs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  // async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
  //   return this.userRepository.createUser(authCredentialsDto);
  // }

  // async signIn(
  //   authCredentialsDto: AuthCredentialsDto,
  // ): Promise<{ accessToken: string }> {
  //   const { username, password } = authCredentialsDto;
  //   const user = await this.userRepository.findOne({ username });

  //   if (user && (await bcrypt.compare(password, user.password))) {
  //     const payload = { username };
  //     const accessToken = await this.jwtService.sign(payload);
  //     return { accessToken };
  //   } else {
  //     throw new UnauthorizedException('login fail');
  //   }
  // }

  async kakaoSignin(query) {
    const data = {
      code: query,
      grant_type: 'authorization_code',
      client_id: '2161226dcbb0f02963a2cdb86da38d87',
      redirect_uri: 'http://localhost:3000/auth/kakao/callback',
      client_secret: 'ewgnhf8Sjs4WoBkhSlfEbrHe3G8CKc8m',
    };
    console.log('hi1');
    const queryStringBody = Object.keys(data)
      .map((k) => encodeURIComponent(k) + '=' + encodeURI(data[k]))
      .join('&');
    console.log('hi2');
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };
    console.log('hi3');
    let response;
    try {
      response = await axios.post(
        'https://kauth.kakao.com/oauth/token',
        queryStringBody,
        config,
      );
    } catch (error) {
      console.log(error);
    }
    console.log(response.data);
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
    const userEmail = userdata.kakao_account.email;
    // const userEmail = 'whtkdgusdldi@naver.com';
    const username = userdata.properties.nickname;
    const user = await this.userRepository.findOne({
      userEmail,
      provider: 'kakao',
    });
    const payload = { userEmail, procider: 'kakao' };
    // console.log(userdata);
    // console.log(payload);
    const accessToken = await this.jwtService.sign(payload);
    // console.log(accessToken);
    if (user) {
      return { accessToken, username: user['username'] };
    } else {
      this.userRepository.createUser(userEmail, username, 'kakao');
      return { accessToken };
    }
  }
}
