import { EntityRepository, Repository } from 'typeorm';
import { ClassList } from './class.entity';
import { ClassDate } from './classDate.entity';
import { DateTime } from 'luxon';

@EntityRepository(ClassDate)
export class ClassDateRepository extends Repository<ClassDate> {
  async createClassDate(Dto, classlist: ClassList) {
    const { startAt, endAt, dayOfWeekAndTime } = Dto;
    const { mon, tue, wed, thu, fri, sat, sun } = dayOfWeekAndTime;
    console.log(dayOfWeekAndTime);
    const start = DateTime.fromISO(startAt);
    const end = DateTime.fromISO(endAt);
    let ii = 0;
    while (start.plus({ day: ii }) <= end) {
      const Dday = start.plus({ day: ii });
      const i = Dday.weekday;
      if (i === 1 && mon) {
        this.creatDate(classlist, Dday, mon);
      }
      if (i === 2 && tue) {
        this.creatDate(classlist, Dday, tue);
      }
      if (i === 3 && wed) {
        this.creatDate(classlist, Dday, wed);
      }
      if (i === 4 && thu) {
        this.creatDate(classlist, Dday, thu);
      }
      if (i === 5 && fri) {
        this.creatDate(classlist, Dday, fri);
      }
      if (i === 6 && sat) {
        this.creatDate(classlist, Dday, sat);
      }
      if (i === 7 && sun) {
        this.creatDate(classlist, Dday, sun);
      }
      ii += 1;
    }
    return { success: true, message: '클레스 달력 생성 성공' };
  }

  async creatDate(classlist, day, time) {
    const dt = DateTime.fromISO(day);
    const classDate = this.create({
      class: classlist,
      year: dt.year,
      month: dt.month,
      day: dt.day,
      weekday: dt.weekday,
      time: time,
    });
    await this.save(classDate);
  }
}
