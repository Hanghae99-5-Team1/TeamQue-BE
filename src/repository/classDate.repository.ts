import { EntityRepository, Repository } from 'typeorm';
import { ClassList } from '../entity/class.entity';
import { ClassDate } from '../entity/classDate.entity';
import { DateTime } from 'luxon';

@EntityRepository(ClassDate)
export class ClassDateRepository extends Repository<ClassDate> {
  async createClassDate(Dto, classlist: ClassList) {
    const { startDate, endDate, times } = Dto;
    const start = DateTime.fromISO(startDate);
    const end = DateTime.fromISO(endDate);
    let ii = 0;
    while (start.plus({ day: ii }) <= end) {
      const Dday = start.plus({ day: ii });
      const i = Dday.weekday;
      for (const weekday of times) {
        const { day, startTime, endTime } = weekday;
        switch (i) {
          case 1:
            if (day === 1) {
              this.creatDate(classlist, Dday, startTime, endTime);
            }
            break;
          case 2:
            if (day === 2) {
              this.creatDate(classlist, Dday, startTime, endTime);
            }
            break;
          case 3:
            if (day === 3) {
              this.creatDate(classlist, Dday, startTime, endTime);
            }
            break;
          case 4:
            if (day === 4) {
              this.creatDate(classlist, Dday, startTime, endTime);
            }
            break;
          case 5:
            if (day === 5) {
              this.creatDate(classlist, Dday, startTime, endTime);
            }
            break;
          case 6:
            if (day === 6) {
              this.creatDate(classlist, Dday, startTime, endTime);
            }
            break;
          case 7:
            if (day === 7) {
              this.creatDate(classlist, Dday, startTime, endTime);
            }
            break;
        }
      }
      ii += 1;
    }
    return { success: true, message: '클레스 달력 생성 성공' };
  }

  async creatDate(classlist, day, startTime, endTime) {
    const dt = DateTime.fromISO(day);
    const classDate = this.create({
      class: classlist,
      year: dt.year,
      month: dt.month,
      day: dt.day,
      weekday: dt.weekday,
      startTime,
      endTime,
    });
    await this.save(classDate);
  }
}
