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
  // const app = await NestFactory.create(AppModule);

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
  let disablekeepAlive = false;
  app.use((req, res, next) => {
    if (disablekeepAlive) {
      res.set('Connection', 'close');
    }
    next();
  });

  process.on('SIGINT', async () => {
    disablekeepAlive = true;
    await app.close();
    process.exit(0);
  });

  app.listen(port, () => {
    process.send('ready');
  });

  Logger.log(`Application running on port ${port}`);
}
bootstrap();
