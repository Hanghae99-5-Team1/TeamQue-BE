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
    });
    await this.save(student);
    return student;
  }
}
