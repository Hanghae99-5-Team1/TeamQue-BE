import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
// import { query } from 'express';
import { AuthService } from './auth.service';
// import { AuthCredentialsDto } from './dto/auth-credential.dto';
import { GetUser } from './get-user.decorator';
import { User } from './user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // @Post('/signup')
  // signup(
  //   @Body(ValidationPipe) authcredentialsDto: AuthCredentialsDto,
  // ): Promise<void> {
  //   return this.authService.signUp(authcredentialsDto);
  // }

  // @Post('/signIn')
  // signIn(
  //   @Body(ValidationPipe) authcredentialsDto: AuthCredentialsDto,
  // ): Promise<{ accessToken: string }> {
  //   return this.authService.signIn(authcredentialsDto);
  // }

  @Get('/kakao/callback')
  kakaoSignin(@Query() query) {
    console.log('controller');
    console.log(`query: ${query.code}`);
    return this.authService.kakaoSignin(query.code);
  }

  @Post('/test')
  @UseGuards(AuthGuard('jwt'))
  // test(@Req() req) {
  //   console.log('req', req);
  // }
  test(@GetUser() user: User) {
    console.log('user', user);
    return user;
  }
}
