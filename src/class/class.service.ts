import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/user.entity';
import { ClassList } from './class.entity';
import { ClassListRepository } from './class.repository';
import { ClassDateRepository } from './classDate.repository';
import { StudentRepository } from './student.repository';
import * as uuid from 'uuid';

@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(ClassListRepository)
    private classlistRepository: ClassListRepository,
    @InjectRepository(ClassDateRepository)
    private classdateRepository: ClassDateRepository,
    @InjectRepository(StudentRepository)
    private studentRepository: StudentRepository,
  ) {}

  async findClassById(id: number): Promise<ClassList> {
    return await this.classlistRepository.findOne({ id });
  }

  async getClass(user: User): Promise<ClassList[]> {
    return await this.classlistRepository.find({ user });
  }

  async getSelectedClass(Dto, id, user): Promise<object> {
    const { year, month } = Dto;
    return await this.classlistRepository
      .createQueryBuilder('C')
      .select([
        'C.id',
        'C.title',
        'C.time',
        'C.teacher',
        'C.imageUrl',
        'C.created_at',
      ])
      .leftJoinAndSelect('C.classdates', 'D')
      .where('C.userid = :userid', { userid: user.id })
      .andWhere('D.year = :year', { year })
      .andWhere('D.month = :month', { month })
      .andWhere('C.id = :id', { id })
      .getMany();
  }

  async createClass(Dto, user: User): Promise<object> {
    const unique = uuid.v4();
    await this.classlistRepository.createClass(Dto, user, unique);
    const classlist = await this.classlistRepository.findOne({ uuid: unique });
    await this.classdateRepository.createClassDate(Dto, classlist);
    return { success: true, message: '클레스 생성 성공' };
  }

  async updateClass(Dto, id, user): Promise<object> {
    const { title, times } = Dto;
    const classlist = await this.classlistRepository.findOne({ id, user });
    classlist.title = title;
    classlist.time = times;
    await this.classlistRepository.save(classlist);
    return { success: true, message: '클레스 수정 성공' };
  }

  async deleteClass(id, user: User): Promise<object> {
    const result = await this.classlistRepository.delete({ id, user });
    if (result.affected === 0) {
      throw new NotFoundException('클레스 삭제 실패');
    }
    return { success: true, message: '클레스 삭제 성공' };
  }

  async getClassDate(id) {
    const classlist = await this.classlistRepository.findOne({ id });
    const classdate = await this.classdateRepository.find({ class: classlist });
    return classdate;
  }

  async getAllClassDateByUser(user, Dto) {
    const { year, month } = Dto;
    return await this.studentRepository
      .createQueryBuilder('S')
      .select([
        'S.classId',
        'D.day',
        'D.startTime',
        'D.endTime',
        'D.weekday',
        'C.title',
      ])
      .leftJoin('S.class', 'C')
      .leftJoin('C.classdates', 'D')
      .where('S.userid = :userid', { userid: user.id })
      .andWhere('D.year = :year', { year })
      .andWhere('D.month = :month', { month })
      .orderBy('D.day', 'ASC')
      .getMany();
  }

  async createClassDate(Dto, id, user: User) {
    const classlist = await this.classlistRepository.findOne({ id, user });
    return this.classdateRepository.createClassDate(Dto, classlist);
  }

  async updateClassDate(Dto, classid, classdateid, user) {
    const { year, month, day, startTime, endTime } = Dto;
    const classlist = await this.classlistRepository.findOne({
      id: classid,
      user,
    });
    const classdate = await this.classdateRepository.findOne({
      id: classdateid,
      class: classlist,
    });
    classdate.year = year;
    classdate.month = month;
    classdate.day = day;
    classdate.startTime = startTime;
    classdate.endTime = endTime;
    await this.classdateRepository.save(classdate);
    return { success: true, message: '클레스 달력 수정 성공' };
  }

  async deleteClassDate(classid, classdateid, user) {
    const classlist = await this.classlistRepository.findOne({
      id: classid,
      user,
    });
    const result = await this.classdateRepository.delete({
      id: classdateid,
      class: classlist,
    });
    if (result.affected === 0) {
      throw new NotFoundException('클레스 달력 삭제 실패');
    }
    return { success: true, message: '클레스 달력 삭제 성공' };
  }
  async deleteAllClassDate(classid, user) {
    const classlist = await this.classlistRepository.findOne({
      id: classid,
      user,
    });
    const result = await this.classdateRepository.delete({ class: classlist });
    if (result.affected === 0) {
      throw new NotFoundException('클레스 달력 삭제 실패');
    }
    return { success: true, message: '클레스 달력 전부 삭제 성공' };
  }

  async createStudent(id, user: User) {
    const classlist = await this.classlistRepository.findOne({ id });
    return this.studentRepository.createStudent(classlist, user);
  }

  async getUserInStudent(id) {
    const classlist = await this.classlistRepository.findOne({ id });
    return await this.studentRepository.find({ class: classlist });
  }

  async getClassInStudent(user: User) {
    return await this.studentRepository
      .createQueryBuilder('S')
      .select(['S.state', 'C.id', 'C.title', 'C.teacher', 'C.time'])
      .leftJoin('S.class', 'C')
      .where('S.userid = :userid', { userid: user.id })
      .orderBy('S.state', 'ASC')
      .getManyAndCount();
  }

  async deleteStudent(id, user: User) {
    const result = await this.studentRepository.delete({ id, user });
    if (result.affected === 0) {
      throw new NotFoundException('수강 취소 실패');
    }
    return { success: true, message: '수강 취소 성공' };
  }
  async updateStudentState(Dto, studentid, classid, user) {
    const { isOk } = Dto;
    const classlist = await this.studentRepository.findOne({
      id: classid,
      user,
    });
    const studentlist = await this.studentRepository.findOne({
      id: studentid,
      class: classlist,
    });
    if (isOk == true) {
      studentlist.state = 'accepted';
    } else {
      studentlist.state = 'rejected';
    }
    await this.studentRepository.save(studentlist);
    return { success: true, message: '수강신청 처리성공' };
  }
}
