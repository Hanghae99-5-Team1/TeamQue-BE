import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as config from 'config';
import { readFileSync } from 'fs';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { urlencoded, json } from 'body-parser';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
  WINSTON_MODULE_NEST_PROVIDER,
} from 'nest-winston';
import * as winston from 'winston';
import * as winstonDaily from 'winston-daily-rotate-file';

async function bootstrap() {
  // const httpsOptions = {
  //   key: readFileSync('../../../etc/letsencrypt/live/noobpro.shop/privkey.pem'),
  //   cert: readFileSync(
  //     '../../../etc/letsencrypt/live/noobpro.shop/fullchain.pem',
  //   ),
  // };
  // const app = await NestFactory.create(AppModule, { httpsOptions });
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          level: 'debug',
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
                `[NestWinston]${info.level}   ${info.timestamp} ${info.message}`,
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
  });
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));
  app.useGlobalPipes(
    new ValidationPipe({
      // whitelist:true;,
      transform: true,
      // forbidNonWhitelisted: true,
    }),
  );
  app.use(cookieParser());
  app.enableCors({
    // origin: 'https://everyque.com',
  });
  const swagconfig = new DocumentBuilder()
    .setTitle('Every Que')
    .setDescription('Every Que API description')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, swagconfig);
  SwaggerModule.setup('api', app, document);

  const serverConfig = config.get('server');
  const port = serverConfig.port;

  //pm2 클러스터 무중단배포
  // let disablekeepAlive = false;
  // app.use((req, res, next) => {
  //   if (disablekeepAlive) {
  //     res.set('Connection', 'close');
  //   }
  //   next();
  // });

  // process.on('SIGINT', async () => {
  //   disablekeepAlive = true;
  //   await app.close();
  //   process.exit(0);
  // });

  app.listen(port, () => {
    // process.send('ready');
  });

  Logger.log(`Application running on port ${port}`);
}
bootstrap();
