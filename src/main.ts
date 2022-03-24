import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import * as config from 'config';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // https setting
  // const keyFile = fs.readFileSync(__dirname + '/key.pem');
  // const certFile = fs.readFileSync(__dirname + 'cert.pem');

  // const app = await NestFactory.create(AppModule, {
  //   httpsOptions: {
  //     key: keyFile,
  //     cert: certFile,
  //   },
  // });

  app.enableCors({
    origin: [],
    credentials: true,
    methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // redis
  // const redisIoAdapter = new RedisIoAdapter(app);
  // await redisIoAdapter.connectToRedis();
  // app.useWebSocketAdapter(redisIoAdapter);

  // const serverConfig = config.get('server');
  // const port = serverConfig.port;

  await app.listen(process.env.HTTP_SERVER_PORT);
  Logger.log(`Application running on port ${process.env.HTTP_SERVER_PORT}`);
}
bootstrap();
