import { User } from 'src/auth/user.entity';
import { EntityRepository, Repository } from 'typeorm';
import { ClassList } from './class.entity';
import { Student } from './student.entity';

@EntityRepository(Student)
export class StudentRepository extends Repository<Student> {
  async createStudent(classlist: ClassList, user: User) {
    const student = this.create({
      class: classlist,
      user,
      userName: user.userName,
      state: 'wait',
    });
    await this.save(student);
    return { success: true, message: '수강 신청 성공' };
  }
}
