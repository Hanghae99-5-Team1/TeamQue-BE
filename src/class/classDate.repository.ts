import { EntityRepository, Repository } from 'typeorm';
import { ClassList } from './class.entity';
import { ClassDate } from './classDate.entity';

@EntityRepository(ClassDate)
export class ClassDateRepository extends Repository<ClassDate> {
  async createClassDate(Dto, classlist: ClassList) {
    const { year, month, day, time } = Dto;
    const classdate = this.create({
      class: classlist,
      year,
      month,
      day,
      time,
    });
    await this.save(classdate);
    return classdate;
  }
}
