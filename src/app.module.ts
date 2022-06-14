import { MiddlewareConsumer, Module } from '@nestjs/common';
import { Connection } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostModule } from './post/post.module';
import { typeORMConfig } from './configs/typeorm.config';
import { UserModule } from './user/user.module';
import { ClassModule } from './class/class.module';
import { ChatModule } from './chat/chat.module';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import * as winston from 'winston';
import * as winstonDaily from 'winston-daily-rotate-file';
import { LoggerMiddleware } from './logger.middleware';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeORMConfig),
    PostModule,
    UserModule,
    ClassModule,
    ChatModule,
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          level: process.env.NODE_ENV === 'development' ? 'debug' : 'info', // production 환경에서는 info level
          format: winston.format.combine(
            winston.format.timestamp(),
            nestWinstonModuleUtilities.format.nestLike('NestWinston', {
              prettyPrint: true,
            }),
          ),
        }),
        new winstonDaily({
          level: 'info', // info 레벨의 경우
          datePattern: 'YYYY-MM-DD',
          dirname: '../logs', // 로그 파일이 저장될 경로
          filename: `%DATE%.log`, // 생성될 파일 이름
          format: winston.format.combine(
            winston.format.timestamp({
              format: 'YYYY-MM-DD HH:mm:ss',
            }),
            winston.format.printf(
              (info) =>
                `[NestWinston]${info.level}   ${info.timestamp} ${info.message}
                인포 ${JSON.stringify(info)}`,
            ),
          ),
          maxFiles: 30, // 30 Days saved
          json: false,
          zippedArchive: true,
        }),
        new winston.transports.File({
          filename: '../logs/errors.log',
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp({
              format: 'YYYY-MM-DD HH:mm:ss',
            }),
            winston.format.printf(
              (info) =>
                `[NestWinston]${info.level}   ${info.timestamp} ${info.message}`,
            ),
          ),
        }),
      ],
    }),
  ],
})
export class AppModule {
  constructor(private connection: Connection) {}
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
