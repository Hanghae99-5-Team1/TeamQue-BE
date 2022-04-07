import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { ClassController } from './class.controller';
import { ClassListRepository } from '../repository/class.repository';
import { ClassService } from './class.service';
import { ClassDateRepository } from '../repository/classDate.repository';
import { StudentRepository } from '../repository/student.repository';
import { AlarmRepository } from 'src/repository/alarm.repository';
import { UserRepository } from 'src/repository/user.repository';
import { OnAirController } from './onair.controller';
import { ChatRepository } from 'src/repository/chat.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClassListRepository,
      ClassDateRepository,
      StudentRepository,
      AlarmRepository,
      UserRepository,
      ChatRepository,
    ]),
    UserModule,
  ],
  controllers: [ClassController, OnAirController],
  providers: [ClassService],
  exports: [ClassService],
})
export class ClassModule {}
