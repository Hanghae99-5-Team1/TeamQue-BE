import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { ClassController } from './class.controller';
import { ClassListRepository } from '../repository/class.repository';
import { ClassService } from './class.service';
import { ClassDateRepository } from '../repository/classDate.repository';
import { StudentRepository } from '../repository/student.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClassListRepository,
      ClassDateRepository,
      StudentRepository,
    ]),
    UserModule,
  ],
  controllers: [ClassController],
  providers: [ClassService],
  exports: [ClassService],
})
export class ClassModule {}
