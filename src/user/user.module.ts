import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtStrategy } from './jwt.strategy';
import { UserRepository } from '../repository/user.repository';
import * as config from 'config';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';
import { RefreshService } from './refresh.service';
import { EmailService } from './email.service';

const jwtConfig = config.get('jwt');

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: jwtConfig.secret,
      signOptions: {
        expiresIn: jwtConfig.expiresIn,
      },
    }),
    TypeOrmModule.forFeature([UserRepository]),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    JwtStrategy,
    JwtRefreshStrategy,
    RefreshService,
    EmailService,
  ],
  exports: [JwtStrategy, PassportModule],
})
export class UserModule {}