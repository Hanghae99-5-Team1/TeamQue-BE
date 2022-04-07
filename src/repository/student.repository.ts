import { User } from 'src/entity/user.entity';
import { EntityRepository, Repository } from 'typeorm';
import { ClassList } from '../entity/class.entity';
import { Student } from '../entity/student.entity';

@EntityRepository(Student)
export class StudentRepository extends Repository<Student> {
  async createStudent(classlist: ClassList, user: User) {
    const student = this.create({
      class: classlist,
      user,
      // name: user.name,
      state: 'wait',
    });
    await this.save(student);
    return { success: true, message: '수강 신청 성공' };
  }
}
