import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from 'src/entity/chat.entity';
import { Student } from 'src/entity/student.entity';
import { ChatRepository } from 'src/repository/chat.repository';
import { StudentRepository } from 'src/repository/student.repository';
import { ReportRepository } from 'src/repository/report.repository';
import { LikeRepository } from 'src/repository/like.repository';
import { UserRepository } from 'src/repository/user.repository';
import { ClassListRepository } from 'src/repository/class.repository';
import * as jwt from 'jsonwebtoken';
import { User } from 'src/entity/user.entity';
import * as config from 'config';
import { ClassList } from 'src/entity/class.entity';

const jwtConfig = config.get('jwt');

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatRepository)
    private chatRepository: ChatRepository,
    @InjectRepository(StudentRepository)
    private readonly studentRepository: StudentRepository,
    @InjectRepository(ReportRepository)
    private reportRepository: ReportRepository,
    @InjectRepository(LikeRepository)
    private likeRepository: LikeRepository,
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    @InjectRepository(ClassListRepository)
    private classRepository: ClassListRepository,
  ) {}

  async verify(token: string): Promise<User | null> {
    try {
      const payload = jwt.verify(token.split(' ')[1], jwtConfig.secret);
      const user: User = await this.userRepository.findOne({
        where: { email: payload['email'] },
      });
      return user !== undefined ? user : null;
    } catch (e) {
      return null;
    }
  }

  async saveChat(
    classId: number,
    userId: number,
    userName: string,
    content: string,
    uuid: string,
    type: number,
  ): Promise<void> {
    await this.chatRepository.createLog(
      classId,
      userId,
      userName,
      content,
      uuid,
      type,
    );
    return;
  }

  async toggleResolved(
    classId: number,
    userId: number,
    uuid: string,
  ): Promise<boolean> {
    const findChat = await this.chatRepository.findOne({
      where: { userId, classId, uuid },
    });

    if (findChat === undefined) return false;

    findChat.isResolved = !findChat.isResolved;
    this.chatRepository.save(findChat);
    return true;
  }

  async findQuestion(classId: number, type: number): Promise<Chat[]> {
    const chats = await this.chatRepository
      .createQueryBuilder('chat')
      .select([
        'chat.userId',
        'chat.userName',
        'chat.content',
        'chat.uuid',
        'chat.like',
        'chat.isResolved',
        'like.userId',
      ])
      .leftJoin('chat.likes', 'like')
      .where('chat.classId = :classId', { classId })
      .andWhere('chat.type = :type', { type })
      .getMany();

    return chats;
  }

  async deleteChat(chatId: string): Promise<boolean> {
    const result = await this.chatRepository.delete({ uuid: chatId });
    return result.affected ? true : false;
  }

  async isStudent(classId: number, userId: number): Promise<boolean> {
    const student = await this.studentRepository.findOne({ classId, userId });
    if (student === undefined) return false;
    return true;
  }

  async findStudents(classId: number): Promise<Student[]> {
    return await this.studentRepository.find({
      select: ['userId'],
      where: { classId },
    });
  }

  async findStudent(userId: number): Promise<Student> {
    return await this.studentRepository.findOne({ userId });
  }

  async findTeacher(userId: number, classId: number): Promise<User | null> {
    const findClass = await this.classRepository.findOne({ id: classId });
    if (!findClass || findClass.userId !== userId) return null;

    const findTeacher = await this.userRepository.findOne({
      select: ['name'],
      where: { id: userId },
    });

    return findTeacher ? findTeacher : null;
  }

  async likeUp(
    userId: number,
    classId: number,
    chatId: string,
  ): Promise<boolean> {
    const findQuestion = await this.chatRepository.findOne({
      where: { uuid: chatId },
    });

    if (findQuestion === undefined) return false;

    const findLike = await this.likeRepository.findOne({
      where: { userId, uuid: chatId },
    });

    if (findLike !== undefined) return false;

    const like = this.likeRepository.create({
      userId,
      classId,
      uuid: chatId,
      chat: findQuestion,
    });
    this.likeRepository.save(like);

    findQuestion.like += 1;
    this.chatRepository.save(findQuestion);
    return true;
  }

  async likeDown(
    userId: number,
    classId: number,
    chatId: string,
  ): Promise<boolean> {
    const findQuestion = await this.chatRepository.findOne({
      where: { uuid: chatId },
    });

    if (findQuestion === undefined) return false;

    const findLike = await this.likeRepository.findOne({
      where: { userId, uuid: chatId },
    });

    if (findLike === undefined) return false;

    await this.likeRepository.delete({
      userId,
      classId,
      uuid: chatId,
    });

    findQuestion.like -= 1;
    this.chatRepository.save(findQuestion);

    return true;
  }

  async countStudentsInClass(classId: number): Promise<object> {
    return await this.studentRepository
      .createQueryBuilder('S')
      .select(['S.userId', 'U.name'])
      .leftJoin('S.user', 'U')
      .where('S.classId =:classId', { classId })
      .getManyAndCount();

    // .findAndCount({
    //   select: ['userId', 'name'],
    //   where: { classId },
    // });
  }

  reportUser(userId: number): void {
    this.reportRepository.createReport(userId);
    return;
  }
}
