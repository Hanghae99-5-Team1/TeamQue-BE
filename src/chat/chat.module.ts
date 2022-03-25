import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateWay } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatLogRepository } from '../repository/ChatLog.repository';
import { StudentRepository } from '../class/student.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ChatLogRepository, StudentRepository])],
  controllers: [],
  providers: [ChatService, ChatGateWay],
})
export class ChatModule {}
