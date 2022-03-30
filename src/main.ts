import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as config from 'config';
import { readFileSync } from 'fs';

async function bootstrap() {
  const httpsOptions = {
    key: readFileSync(
      'C:/Users/XPEC/Desktop/sparta/TeamQue-BE/key/privkey.pem',
    ),
    cert: readFileSync('C:/Users/XPEC/Desktop/sparta/TeamQue-BE/key/cert.pem'),
  };

  // ubuntu
  // /home/ubuntu/TeamQue-BE/key/privkey.pem
  // /home/ubuntu/TeamQue-BE/key/cert.pem

  const app = await NestFactory.create(AppModule, {
    httpsOptions,
  });
  //유효성 검사
  app.useGlobalPipes(
    new ValidationPipe({
      // whitelist:true;,
      transform: true,
      // forbidNonWhitelisted: true,
    }),
  );
  app.enableCors();

  const serverConfig = config.get('server');
  const port = serverConfig.port;

  await app.listen(3443);
  Logger.log(`Application running on port ${port}`);
}
bootstrap();
