import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Put,
  Query,
  Redirect,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GetUser } from './get-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { User } from './user.entity';
import { RefreshService } from './refresh.service';
import { AuthCredentialsDto } from './dto/auth-credential.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private refreshService: RefreshService,
  ) {}

  @Post('/signup')
  signup(
    @Body(ValidationPipe) authcredentialsDto: AuthCredentialsDto,
  ): Promise<object> {
    return this.authService.signUp(authcredentialsDto);
  }

  @Post('/email-verify')
  @Redirect('http://localhost:3000')
  async emailVerify(@Query() dto) {
    const { signupVerifyToken } = dto;
    this.authService.verifyEmail(signupVerifyToken);
  }

  @Post('/signIn')
  signIn(@Body() Dto): Promise<object> {
    return this.authService.signIn(Dto);
  }

  @Get('/kakao/callback')
  kakaoSignin(@Query() query) {
    return this.authService.kakaoSignin(query.code);
  }

  @Post('/refresh')
  @UseGuards(JwtRefreshGuard)
  refreshToken(@GetUser() user, @Headers('authorization') token1: string) {
    const token = token1.split(' ')[1];
    return this.refreshService.getUserIfRefreshTokenMatches(token, user);
  }

  @Put('/nickname')
  @UseGuards(JwtAuthGuard)
  modifyUsername(@Body() Dto, @GetUser() user: User) {
    console.log(Dto);
    return this.authService.modifyUsername(Dto.nickname, user.id);
  }

  @Post('/logout')
  @UseGuards(JwtAuthGuard)
  logoutUser(@GetUser() user) {
    this.refreshService.removeRefreshToken(user.id);
  }

  @Get('/test')
  @UseGuards(JwtAuthGuard)
  test(@GetUser() user: User) {
    console.log('user', user);
    return user;
  }
}
