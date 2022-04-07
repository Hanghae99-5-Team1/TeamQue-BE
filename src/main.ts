import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as config from 'config';
import { readFileSync } from 'fs';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { urlencoded, json } from 'body-parser';

async function bootstrap() {
  const httpsOptions = {
    key: readFileSync(
      'C:/Users/XPEC/Desktop/sparta/TeamQue-BE/key/privkey.pem',
    ),
    cert: readFileSync('C:/Users/XPEC/Desktop/sparta/TeamQue-BE/key/cert.pem'),
  };
  const app = await NestFactory.create(AppModule, { httpsOptions });
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));
  //유효성 검사
  app.useGlobalPipes(
    new ValidationPipe({
      // whitelist:true;,
      transform: true,
      // forbidNonWhitelisted: true,
    }),
  );
  //세션사용
  app.use(cookieParser());
  //cors설정 => 수정필
  app.enableCors();
  //스웨그 설정
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
