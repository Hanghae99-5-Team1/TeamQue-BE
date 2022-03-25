import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as config from 'config';
import { readFileSync } from 'fs';

async function bootstrap() {
  const httpsOptions = {
    key: readFileSync('../../../etc/letsencrypt/live/noobpro.shop/privkey.pem'),
    cert: readFileSync(
      '../../../etc/letsencrypt/live/noobpro.shop/fullchain.pem',
    ),
  };
  const app = await NestFactory.create(AppModule, { httpsOptions });
  //cors 처리
  app.enableCors();
  //유효성 검사
  app.useGlobalPipes(
    new ValidationPipe({
      // whitelist:true;,
      transform: true,
    }),
  );

  const serverConfig = config.get('server');
  const port = serverConfig.port;

  await app.listen(port);
  Logger.log(`Application running on port ${port}`);
}
bootstrap();
