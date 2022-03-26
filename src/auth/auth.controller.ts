import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Post,
  Put,
  Query,
  Redirect,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GetUser } from './get-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { User } from '../entity/user.entity';
import { RefreshService } from './refresh.service';
import { AuthCredentialsDto } from './dto/auth-credential.dto';
import { ModifyUserDto } from './dto/modify-user.dto';
import { authSignInDto } from './dto/auth-signin.dto';
import { OnewordDto } from './dto/oneword.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private refreshService: RefreshService,
  ) {}
  //회원가입
  @Post('/signup')
  signup(@Body() Dto: AuthCredentialsDto): Promise<object> {
    return this.authService.signUp(Dto);
  }
  //이메일 api
  @Post('/email-verify')
  @Redirect('http://localhost:3000')
  async emailVerify(@Query() dto) {
    const { signupVerifyToken } = dto;
    this.authService.verifyEmail(signupVerifyToken);
  }
  //로그인
  @Post('/signin')
  signIn(@Body() Dto: authSignInDto): Promise<object> {
    return this.authService.signIn(Dto);
  }
  //카카오 로그인
  @Get('/kakao/callback')
  kakaoSignin(@Query() query) {
    return this.authService.kakaoSignin(query.code);
  }
  //엑서스 토큰 재발행
  @Post('/refresh')
  @UseGuards(JwtRefreshGuard)
  refreshToken(@GetUser() user, @Headers('authorization') token1: string) {
    const token = token1.split(' ')[1];
    return this.refreshService.getUserIfRefreshTokenMatches(token, user);
  }
  //유저 닉네임 및 패스워드 수정
  @Put('/modifyinfo')
  @UseGuards(JwtAuthGuard)
  modifyUsername(@Body() Dto: ModifyUserDto, @GetUser() user: User) {
    if (Dto.nickname) {
      this.authService.modifyUsername(Dto.nickname, user.id);
    }
    if (Dto.password && Dto.confirmPassword) {
      this.authService.modifyPassword(Dto, user.id);
    }
    return { success: true, message: '수정성공' };
  }
  //로그아웃
  @Post('/logout')
  @UseGuards(JwtAuthGuard)
  logoutUser(@GetUser() user: User): Promise<object> {
    return this.refreshService.removeRefreshToken(user.id);
  }
  //회원탈퇴
  @Delete('/withdrawal')
  @UseGuards(JwtAuthGuard)
  withdrawalUser(@GetUser() user: User): Promise<object> {
    return this.authService.deleteUser(user);
  }
  //유저정보확인
  @Get('/test')
  @UseGuards(JwtAuthGuard)
  test(@GetUser() user: User) {
    return {
      userName: user.userName,
      userid: user.id,
      userEmail: user.userEmail,
      oneword: user.oneword,
      createAt: user.createdAt,
    };
  }
  //나의 한마디 수정
  @Put('/oneword')
  @UseGuards(JwtAuthGuard)
  changOneword(@GetUser() user: User, @Body() Dto: OnewordDto) {
    return this.authService.changOneword(user.id, Dto);
  }
}
