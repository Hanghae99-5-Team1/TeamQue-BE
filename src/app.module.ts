import { Module } from '@nestjs/common';
import { Connection } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardsModule } from './boards/boards.module';
import { typeORMConfig } from './configs/typeorm.config';
import { AuthModule } from './auth/auth.module';
<<<<<<< HEAD
import { ClassModule } from './class/classes.module';
=======
import { ClassModule } from './class/class.module';
>>>>>>> 709a134491bdcfc6d407646ffecf7c4b81d6104e
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeORMConfig),
    BoardsModule,
    AuthModule,
    ClassModule,
    ChatModule,
  ],
})
export class AppModule {
  constructor(private connection: Connection) {}
}
