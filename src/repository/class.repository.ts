import { BadRequestException } from '@nestjs/common';
import { User } from 'src/entity/user.entity';
import { EntityRepository, Repository } from 'typeorm';
import { ClassList } from '../entity/class.entity';

@EntityRepository(ClassList)
export class ClassListRepository extends Repository<ClassList> {
  async createClass(Dto, user: User, unique): Promise<object> {
    const { title, times, imageUrl, startDate, endDate } = Dto;
    let timeTable = '';
    const days = ['월', '화', '수', '목', '금', '토', '일'];
    for (const weekday of times) {
      const { day, startTime, endTime } = weekday;
      timeTable += `${days[day - 1]} ${startTime}~${endTime}/`;
    }
    if (!timeTable) {
      throw new BadRequestException('수업일을 설정해주세요');
    }
    const classlist = this.create({
      user,
      title,
      timeTable,
      teacher: user.name,
      imageUrl,
      uuid: unique,
      startDate,
      endDate,
    });
    await this.save(classlist);
    return classlist;
  }
}
