import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Put,
  Query,
  Redirect,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { GetUser } from './get-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { User } from '../entity/user.entity';
import { RefreshService } from './refresh.service';
import { AuthCredentialsDto } from './dto/auth-credential.dto';
import { EditInfoDto } from './dto/modify-user.dto';
import { authSignInDto } from './dto/auth-signin.dto';
import { Hash } from 'crypto';

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private refreshService: RefreshService,
  ) {}
  //회원가입
  @Post('/signup')
  signup(@Body() Dto: AuthCredentialsDto): Promise<object> {
    return this.userService.signUp(Dto);
  }
  //이메일 api
  @Post('/email-verify')
  @Redirect('https://everyque.com')
  async emailVerify(@Query() dto) {
    const { signupVerifyToken } = dto;
    this.userService.verifyEmail(signupVerifyToken);
  }
  //로그인
  @Post('/signin')
  signIn(@Body() Dto: authSignInDto): Promise<object> {
    return this.userService.signIn(Dto);
  }
  //카카오 콜벡
  @Get('/kakao/callback')
  kakaoCallback(@Query() query) {
    return this.userService.kakaoCallback(query.code);
  }
  //카카오 인증요청
  @Get('/kakao')
  @Redirect('https://kauth.kakao.com')
  async kakakoSignin() {
    const { KAKAO_ID, KAKAO_REDIRECT_URI } =
      await this.userService.kakaoSignin();
    return {
      url: `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_ID}&redirect_uri=${KAKAO_REDIRECT_URI}&response_type=code`,
    };
  }

  //구글콜백
  @Get('/google/callback')
  googleCallback(@Query() query) {
    return this.userService.googleCallback(query.code);
  }

  //구글 인증요청
  @Get('/google')
  @Redirect('https://accounts.google.com/')
  async googleSignin() {
    const { GOOGLE_ID, GOOGLE_REDIRECT_URI } =
      await this.userService.googleSignin();
    return {
      url: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_ID}&response_type=code&redirect_uri=${GOOGLE_REDIRECT_URI}&scope=https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email`,
    };
  }

  //엑서스 토큰 재발행
  @Post('/refresh')
  @UseGuards(JwtRefreshGuard)
  refreshToken(
    @GetUser() user: User,
    @Headers('authorization') token1: string,
  ) {
    const token = token1.split(' ')[1];
    return this.refreshService.getUserIfRefreshTokenMatches(token, user);
  }
  //유저 닉네임 및 패스워드 수정
  @Put('/edit')
  @UseGuards(JwtAuthGuard)
  editInfo(@Body() Dto: EditInfoDto, @GetUser() user: User) {
    if (Dto.name) {
      this.userService.editname(Dto.name, user.id);
    }
    if (Dto.password && Dto.confirmPassword) {
      this.userService.editPassword(Dto, user.id);
    }
    if (!Dto.name && !Dto.password && !Dto.confirmPassword) {
      throw new BadRequestException('입력된 값이 없습니다');
    }
    return { success: true, message: '수정성공' };
  }
  //로그아웃
  @Post('/signout')
  @UseGuards(JwtAuthGuard)
  logoutUser(@GetUser() user: User): Promise<object> {
    return this.refreshService.removeRefreshToken(user.id);
  }
  //회원탈퇴
  @Delete('/withdraw')
  @UseGuards(JwtAuthGuard)
  withdrawalUser(@GetUser() user: User): Promise<object> {
    return this.userService.deleteUser(user);
  }
  //유저정보확인
  @Get('/')
  @UseGuards(JwtAuthGuard)
  test(@GetUser() user: User) {
    return {
      name: user.name,
      id: user.id,
      email: user.email,
    };
  }
}
