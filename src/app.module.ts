import { Module } from '@nestjs/common';
import { Connection } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostModule } from './post/post.module';
import { typeORMConfig } from './configs/typeorm.config';
import { UserModule } from './user/user.module';
import { ClassModule } from './class/class.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeORMConfig),
    PostModule,
    UserModule,
    ClassModule,
    ChatModule,
  ],
})
export class AppModule {
  constructor(private connection: Connection) {}
}
