import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateWay } from './chat.gateway';
import { ChatService } from './chat.service';
import { AuthModule } from 'src/auth/auth.module';
import { ChatRepository } from 'src/repository/chat.repository';
import { StudentRepository } from 'src/repository/student.repository';
import { ReportRepository } from 'src/repository/report.repository';
import { LikeRepository } from 'src/repository/like.repository';
import { UserRepository } from 'src/repository/user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatRepository,
      StudentRepository,
      ReportRepository,
      LikeRepository,
      UserRepository,
    ]),
  ],
  controllers: [],
  providers: [ChatService, ChatGateWay],
})
export class ChatModule {}
