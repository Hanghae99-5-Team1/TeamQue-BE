import { User } from 'src/auth/user.entity';
import { EntityRepository, Repository } from 'typeorm';
import { ClassList } from './class.entity';

@EntityRepository(ClassList)
export class ClassListRepository extends Repository<ClassList> {
  async createClass(Dto, user: User): Promise<object> {
    const { title, time, imageUrl } = Dto;
    const classlist = this.create({
      user,
      title,
      time,
      teacher: user.username,
      imageUrl,
    });
    await this.save(classlist);
    return { success: true, message: '클레스 생성 성공' };
  }
}
