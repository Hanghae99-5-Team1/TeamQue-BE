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

  async createClass(Dto, user: User): Promise<ClassList> {
    return await this.classlistRepository.createClass(Dto, user);
  }

  async deleteClass(id, user: User): Promise<void> {
    const result = await this.classlistRepository.delete({ id, user });
    if (result.affected === 0) {
      throw new NotFoundException(`Can't delete Class with id ${id}`);
    }
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
    return classdate;
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
      throw new NotFoundException(
        `Can't delete classdate with id ${classdateid}`,
      );
    }
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
    return await this.studentRepository.find({ user });
  }

  async deleteStudent(id, user: User) {
    const result = await this.studentRepository.delete({ id, user });
    if (result.affected === 0) {
      throw new NotFoundException(`Can't delete student with id ${id}`);
    }
  }
}
