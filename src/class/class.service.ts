import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/user.entity';
import { ClassList } from './class.entity';
import { ClassListRepository } from './class.repository';
import { ClassDateRepository } from './classDate.repository';
import { StudentRepository } from './student.repository';

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

  async getSelectedClass(id, user): Promise<object> {
    return await this.classlistRepository.findOne({ id, user });
  }

  async createClass(Dto, user: User): Promise<object> {
    return await this.classlistRepository.createClass(Dto, user);
  }

  async updateClass(Dto, id, user): Promise<object> {
    const { title, time } = Dto;
    const classlist = await this.classlistRepository.findOne({ id, user });
    classlist.title = title;
    classlist.time = time;
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

  async createClassDate(Dto, id, user: User) {
    const classlist = await this.classlistRepository.findOne({ id, user });
    return this.classdateRepository.createClassDate(Dto, classlist);
  }

  async updateClassDate(Dto, classid, classdateid, user) {
    const { year, month, day, time } = Dto;
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
    classdate.time = time;
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

  async createStudent(id, user: User) {
    const classlist = await this.classlistRepository.findOne({ id });
    return this.studentRepository.createStudent(classlist, user);
  }

  async getUserInStudent(id) {
    const classlist = await this.classlistRepository.findOne({ id });
    return await this.studentRepository.find({ class: classlist });
  }

  async getClassInStudent(user: User) {
    return await this.studentRepository.find({
      where: { user },
      relations: ['class'],
    });
  }

  async deleteStudent(id, user: User) {
    const result = await this.studentRepository.delete({ id, user });
    if (result.affected === 0) {
      throw new NotFoundException('수강 취소 실패');
    }
    return { success: true, message: '수강 취소 성공' };
  }
}
