import { User } from 'src/auth/user.entity';
import { EntityRepository, Repository } from 'typeorm';
import { ClassList } from './class.entity';

@EntityRepository(ClassList)
export class ClassListRepository extends Repository<ClassList> {
  async createClass(Dto, user: User): Promise<ClassList> {
    const { title, time } = Dto;
    const classlist = this.create({
      user,
      title,
      time,
      teacher: user.username,
    });
    await this.save(classlist);
    return classlist;
  }
}
