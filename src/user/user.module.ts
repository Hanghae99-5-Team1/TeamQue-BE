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
import { AlarmRepository } from 'src/repository/alarm.repository';
import { StudentRepository } from 'src/repository/student.repository';
import { ClassService } from 'src/class/class.service';
import { ClassModule } from 'src/class/class.module';

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
    TypeOrmModule.forFeature([
      UserRepository,
      AlarmRepository,
      StudentRepository,
    ]),
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
