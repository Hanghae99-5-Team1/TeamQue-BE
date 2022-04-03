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
  Res,
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
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private refreshService: RefreshService,
  ) {}

  //회원가입
  @Post('/signup')
  @ApiTags('user')
  @ApiOperation({
    summary: '회원가입',
    description: '회원가입',
  })
  @ApiCreatedResponse({ description: '회원가입' })
  @ApiBody({ type: AuthCredentialsDto })
  signup(@Body() Dto: AuthCredentialsDto): Promise<object> {
    return this.userService.signUp(Dto);
  }

  //비밀번호 변경
  @Post('/findpassword')
  @ApiTags('user')
  @ApiOperation({
    summary: '비밀번호 찾기',
    description: '비밀번호 찾기',
  })
  @ApiCreatedResponse({ description: '이메일 송신' })
  @ApiBody({ type: AuthCredentialsDto })
  findPassword(@Body() Dto) {
    return this.userService.findPassword(Dto);
  }

  //이메일 api
  @Post('/email-verify')
  @ApiTags('user')
  @Redirect('https://everyque.com')
  async emailVerify(@Query() dto, @Res() res) {
    const { signupVerifyToken } = dto;
    const { accessToken, refreshToken } = await this.userService.verifyEmail(
      signupVerifyToken,
    );
    // res.cookie('refreshToken', refreshToken);
    // res.cookie('accessToken', accessToken);
    // return res.redirect('https://everyque.com/auth');
    return {
      url: `https://everyque.com/auth?accessToken=${accessToken}&refreshToken=${refreshToken}`,
    };
  }

  //로그인
  @Post('/signin')
  @ApiTags('user')
  @ApiOperation({
    summary: '로그인',
    description: '로그인',
  })
  @ApiCreatedResponse({ description: '로그인' })
  @ApiBody({ type: authSignInDto })
  signIn(@Body() Dto: authSignInDto): Promise<object> {
    return this.userService.signIn(Dto);
  }

  //카카오 콜벡
  @Get('/kakao/callback')
  @ApiTags('user')
  @Redirect('https://everyque.com')
  async kakaoCallback(@Query() query, @Res() res) {
    const { accessToken, refreshToken } = await this.userService.kakaoCallback(
      query.code,
    );
    // res.cookie('refreshToken', refreshToken);
    // res.cookie('accessToken', accessToken);
    // res.session.token = { accessToken, refreshToken };
    // res.session.save();
    // return res.redirect('https://everyque.com/auth');
    return {
      url: `https://everyque.com/auth?accessToken=${accessToken}&refreshToken=${refreshToken}`,
    };
  }

  //카카오 인증요청
  @Get('/kakao')
  @ApiTags('user')
  @ApiOperation({
    summary: '카카오 로그인',
    description: '카카오 로그인',
  })
  @ApiOkResponse({ description: '카카오 로그인' })
  @Redirect('https://kauth.kakao.com')
  async kakakoSignin() {
    const { KAKAO_ID, KAKAO_REDIRECT_URI } =
      await this.userService.kakaoSignin();
    return {
      url: `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_ID}&redirect_uri=${KAKAO_REDIRECT_URI}&response_type=code`,
    };
  }

  //구글콜백
  @Redirect('https://everyque.com')
  @ApiTags('user')
  @Get('/google/callback')
  async googleCallback(@Query() query, @Res() res) {
    const { accessToken, refreshToken } = await this.userService.googleCallback(
      query.code,
    );
    // res.cookie('refreshToken', refreshToken);
    // res.cookie('accessToken', accessToken);
    // return res.redirect('https://everyque.com/auth');
    return {
      url: `https://everyque.com/auth?accessToken=${accessToken}&refreshToken=${refreshToken}`,
    };
  }

  //구글 인증요청
  @Get('/google')
  @ApiTags('user')
  @ApiOperation({
    summary: '구글 로그인',
    description: '구글 로그인',
  })
  @ApiOkResponse({ description: '구글 로그인' })
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
  @ApiTags('user')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtRefreshGuard)
  @ApiOperation({
    summary: 'accessToken 재발급',
    description: 'accessToken 재발급',
  })
  @ApiOkResponse({ description: 'accessToken 재발급' })
  refreshToken(
    @GetUser() user: User,
    @Headers('authorization') token1: string,
  ) {
    const token = token1.split(' ')[1];
    return this.refreshService.getUserIfRefreshTokenMatches(token, user);
  }

  //유저 닉네임 및 패스워드 수정
  @Put('/edit')
  @ApiTags('user')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '유저 정보 수정',
    description: '유저 이름,비밀번호 수정',
  })
  @ApiOkResponse({ description: '유저 이름,비밀번호 수정' })
  @ApiBody({ type: EditInfoDto })
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
  @ApiTags('user')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '로그아웃',
    description: '로그아웃',
  })
  @ApiOkResponse({ description: '로그아웃' })
  logoutUser(@GetUser() user: User): Promise<object> {
    return this.refreshService.removeRefreshToken(user.id);
  }

  //회원탈퇴
  @Put('/delete')
  @ApiTags('user')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '회원탈퇴',
    description: '회원탈퇴',
  })
  @ApiOkResponse({ description: '회원탈퇴' })
  withdrawalUser(@GetUser() user: User, @Body() Dto): Promise<object> {
    return this.userService.deleteUser(user, Dto);
  }

  //유저정보확인
  @Get('/')
  @ApiTags('user')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '회원 정보',
    description: '회원 정보 및 알림',
  })
  @ApiOkResponse({ description: '회원 정보 및 알림' })
  async getUser(@GetUser() user: User) {
    const alarm = await this.userService.checkAlarm(user);
    return {
      alarm: alarm,
      name: user.name,
      id: user.id,
      email: user.email,
    };
  }
  //알람지정삭제
  @Delete('/alarm/:alarmid')
  @ApiTags('user/alarm')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '알림 삭제',
    description: '알림 삭제',
  })
  @ApiOkResponse({ description: '알림 삭제' })
  deleteAlarm(@GetUser() user: User, @Param('alarmid') alarmid) {
    return this.userService.deleteAlarm(user, alarmid);
  }
  //알람전부삭제
  @Delete('/allalarm')
  @ApiTags('user/alarm')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '알림 전부 삭제',
    description: '알림 전부 삭제',
  })
  @ApiOkResponse({ description: '알림 전부 삭제' })
  deleteAllAlarm(@GetUser() user: User) {
    return this.userService.deleteAllAlarm(user);
  }
}
