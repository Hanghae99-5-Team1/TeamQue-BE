import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatLogRepository } from '../repository/ChatLog.repository';
import { StudentRepository } from '../repository/student.repository';
import { ChatLog } from 'src/entity/ChatLog.entity';
import { Student } from 'src/entity/student.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatLogRepository)
    private chatRepository: ChatLogRepository,
    @InjectRepository(StudentRepository)
    private readonly studentRepository: StudentRepository,
  ) {}

  async saveChat(
    classId: number,
    writer: string,
    contents: string,
    uuid: string,
    type: number,
  ): Promise<void> {
    await this.chatRepository.createLog(classId, writer, contents, uuid, type);
    return;
  }

  async checkWriter(
    classId: number,
    writer: string,
    uuid: string,
  ): Promise<boolean> {
    const findWriter = await this.chatRepository.findOne({
      classId,
      writer,
      uuid,
    });

    return findWriter ? true : false;
  }

  async findAllChatLog(classId: number): Promise<ChatLog[]> {
    return await this.chatRepository.find({ classId, type: 2 });
  }

  async findStudents(classId: number): Promise<Student[]> {
    return await this.studentRepository.find({ classId });
  }
}
