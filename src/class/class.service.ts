import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entity/user.entity';
import { ClassList } from '../entity/class.entity';
import { ClassListRepository } from '../repository/class.repository';
import { ClassDateRepository } from '../repository/classDate.repository';
import { StudentRepository } from '../repository/student.repository';
import * as uuid from 'uuid';
import { DateTime } from 'luxon';
import { AlarmRepository } from 'src/repository/alarm.repository';
import { UserRepository } from 'src/repository/user.repository';
import { Connection } from 'typeorm';
import { ChatRepository } from 'src/repository/chat.repository';
import * as crypto from 'crypto';

@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(ClassListRepository)
    private classlistRepository: ClassListRepository,
    @InjectRepository(ClassDateRepository)
    private classdateRepository: ClassDateRepository,
    @InjectRepository(StudentRepository)
    private studentRepository: StudentRepository,
    @InjectRepository(AlarmRepository)
    private alarmRepository: AlarmRepository,
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    private connection: Connection,
    @InjectRepository(ChatRepository)
    private chatRepository: ChatRepository,
  ) {}

  async findClassById(id: number): Promise<ClassList> {
    return await this.classlistRepository.findOne({ id });
  }

  async getClass(user: User): Promise<object> {
    const classlist = await this.classlistRepository
      .createQueryBuilder('C')
      .select([
        'C.id',
        'C.title',
        'C.timeTable',
        'C.imageUrl',
        'C.startDate',
        'C.endDate',
        'U.name',
        'C.isStream',
      ])
      .leftJoin('C.user', 'U')
      .where('C.userid = :userid', { userid: user.id })
      .getMany();

    const mappingClasslist = classlist.map((data) => ({
      id: data.id,
      title: data.title,
      timeTable: data.timeTable.split('/').slice(0, -1),
      teacher: data.user.name,
      imageUrl: data.imageUrl,
      state: 'teach',
      progress:
        DateTime.fromISO(data.startDate) > DateTime.now()
          ? '?????????'
          : DateTime.fromISO(data.endDate) > DateTime.now()
          ? '?????????'
          : '??????',
      startDate: data.startDate,
      endDate: data.endDate,
      isStream: data.isStream,
    }));
    return mappingClasslist;
  }

  async getSelectedClass(id, user): Promise<object> {
    const selectedClass = await this.classlistRepository
      .createQueryBuilder('C')
      .select([
        'C.id',
        'C.title',
        'C.timeTable',
        'U.name',
        'C.imageUrl',
        'C.createdAt',
        'C.userId',
        'C.uuid',
        'C.startDate',
        'C.endDate',
        'C.isStream',
      ])
      .leftJoin('C.user', 'U')
      .where('C.id = :id', { id })
      .getOne();
    let isByMe = false;
    if (selectedClass.userId === user.id) {
      isByMe = true;
    }
    return {
      id: selectedClass.id,
      title: selectedClass.title,
      timeTable: selectedClass.timeTable.split('/').slice(0, -1),
      teacher: selectedClass.user.name,
      imageUrl: selectedClass.imageUrl,
      createdAt: selectedClass.createdAt,
      isByMe: isByMe,
      startDate: selectedClass.startDate,
      endDate: selectedClass.endDate,
      isStream: selectedClass.isStream,
    };
  }

  async createClass(Dto, user: User): Promise<object> {
    const unique = uuid.v4();
    await this.classlistRepository.createClass(Dto, user, unique);
    const classlist = await this.classlistRepository.findOne({ uuid: unique });
    await this.classdateRepository.createClassDate(Dto, classlist);
    return {
      success: true,
      message: '????????? ?????? ??????',
      classid: classlist.id,
    };
  }

  async updateClass(Dto, id, user): Promise<object> {
    const { title, imageUrl, times, startDate, endDate } = Dto;
    const classlist = await this.classlistRepository.findOne({ id, user });
    if (!classlist) {
      throw new BadRequestException('?????? ???????????? ????????????');
    }
    let timeTable = '';
    const days = ['???', '???', '???', '???', '???', '???', '???'];
    for (const weekday of times) {
      const { day, startTime, endTime } = weekday;
      timeTable += `${days[day - 1]} [${startTime}~${endTime}]/`;
    }
    if (!timeTable) {
      throw new BadRequestException('???????????? ??????????????????');
    }
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      classlist.title = title;
      classlist.imageUrl = imageUrl;
      classlist.startDate = startDate;
      classlist.endDate = endDate;
      classlist.timeTable = timeTable;
      await this.classlistRepository.save(classlist);
      await this.classdateRepository.delete({ classId: classlist.id });
      await this.classdateRepository.createClassDate(Dto, classlist);
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw new ConflictException({ message: '???????????? ????????????????????????' });
    } finally {
      await queryRunner.release();
      return { success: true, message: '????????? ?????? ??????' };
    }
  }

  async deleteClass(id, user: User): Promise<object> {
    const result = await this.classlistRepository.delete({ id, user });
    if (result.affected === 0) {
      throw new NotFoundException('????????? ?????? ??????');
    }
    return { success: true, message: '????????? ?????? ??????' };
  }

  async getClassDate(id, year, month) {
    const classlist = await this.classlistRepository.findOne({ id });
    const classdate = await this.classdateRepository
      .createQueryBuilder('D')
      .select(['D.day', 'D.startTime', 'D.endTime', 'C.title'])
      .leftJoin('D.class', 'C')
      .where('D.classid = :classid', { classid: classlist.id })
      .andWhere('D.year = :year', { year })
      .andWhere('D.month = :month', { month })
      .orderBy('D.day', 'ASC')
      .getMany();

    const mappingClassdate = classdate.map((data) => ({
      day: data.day,
      startTime: data.startTime,
      endTime: data.endTime,
      title: data.class.title,
    }));
    return mappingClassdate;
  }

  async getAllClassDateByUser(user, year, month) {
    const Alldate = await this.classdateRepository
      .createQueryBuilder('D')
      .select(['D.day', 'D.startTime', 'D.endTime', 'C.title'])
      .leftJoin('D.class', 'C')
      .leftJoin('C.students', 'S')
      .where('S.userid = :userid', { userid: user.id })
      .andWhere('D.year = :year', { year })
      .andWhere('D.month = :month', { month })
      .orderBy('D.day', 'ASC')
      .getMany();
    const mappingAlldate = Alldate.map((data) => ({
      day: data.day,
      startTime: data.startTime,
      endTime: data.endTime,
      title: data.class.title,
    }));
    return mappingAlldate;
  }

  async createClassDate(Dto, id, user: User) {
    const { times, startDate, endDate } = Dto;
    const classlist = await this.classlistRepository.findOne({ id, user });
    let timeTable = '';
    const days = ['???', '???', '???', '???', '???', '???', '???'];
    for (const weekday of times) {
      const { day, startTime, endTime } = weekday;
      timeTable += `${days[day - 1]} [${startTime}~${endTime}]/`;
    }
    if (!timeTable) {
      throw new BadRequestException('???????????? ??????????????????');
    }
    classlist.startDate = startDate;
    classlist.endDate = endDate;
    classlist.timeTable = timeTable;
    await this.classlistRepository.save(classlist);
    return this.classdateRepository.createClassDate(Dto, classlist);
  }

  async updateClassDate(Dto, classid, classdateid, user) {
    const { year, month, day, startTime, endTime } = Dto;
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
    classdate.weekday = DateTime.local(year, month, day).weekday;
    classdate.startTime = startTime;
    classdate.endTime = endTime;
    await this.classdateRepository.save(classdate);
    return { success: true, message: '????????? ?????? ?????? ??????' };
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
      throw new NotFoundException('????????? ?????? ?????? ??????');
    }
    return { success: true, message: '????????? ?????? ?????? ??????' };
  }
  async deleteAllClassDate(classid, user) {
    const classlist = await this.classlistRepository.findOne({
      id: classid,
      user,
    });
    const result = await this.classdateRepository.delete({ class: classlist });
    if (result.affected === 0) {
      throw new NotFoundException('????????? ?????? ?????? ??????');
    }
    return { success: true, message: '????????? ?????? ?????? ?????? ??????' };
  }

  async createStudent(Dto, user: User) {
    const { inviteCode } = Dto;
    const uuid = this.decipher(inviteCode, 'teamQue9929');
    const classlist = await this.classlistRepository.findOne({ uuid });
    if (!classlist) {
      throw new BadRequestException('????????? ????????????');
    }
    if (classlist.userId === user.id) {
      throw new BadRequestException('???????????? ????????? ??????????????? ???????????????');
    }
    const findExist = await this.studentRepository.findOne({
      user,
      classId: classlist.id,
    });
    if (findExist) {
      throw new BadRequestException('?????? ????????? ???????????????');
    }
    return this.studentRepository.createStudent(classlist, user);
  }

  async getUserInStudent(id) {
    const classlist = await this.classlistRepository.findOne({ id });
    const student = await this.studentRepository
      .createQueryBuilder('S')
      .select(['S.state', 'U.name', 'S.userId'])
      .leftJoin('S.user', 'U')
      .where('S.classid = :classid', { classid: classlist.id })
      .orderBy('S.name', 'ASC')
      .orderBy('S.state', 'ASC')
      .getMany();

    return student.map((data) => ({
      state: data.state,
      name: data.user.name,
      userId: data.userId,
    }));
  }

  // .andWhere('S.state IN (:...state)', { state: ['wait', 'accepted'] })

  // .andWhere(
  //   new Brackets((qb) => {
  //     qb.where('S.state = :state', { state: 'wait' }).orWhere(
  //       'S.state = :state',
  //       { state: 'accepted' },
  //     );
  //   }),
  // )

  async getClassInStudent(user: User) {
    const student = await this.classlistRepository
      .createQueryBuilder('C')
      .select([
        'C.id',
        'C.title',
        'U.name',
        'C.timeTable',
        'C.imageUrl',
        'S.state',
        'C.startDate',
        'C.endDate',
        'C.isStream',
      ])
      .leftJoin('C.students', 'S')
      .leftJoin('C.user', 'U')
      .where('S.userid = :userid', { userid: user.id })
      .orderBy('S.state', 'ASC')
      .getMany();
    const mappingStudent = student.map((data) => ({
      id: data.id,
      title: data.title,
      teacher: data.user.name,
      timeTable: data.timeTable.split('/').slice(0, -1),
      imageUrl: data.imageUrl,
      state: data.students[0].state,
      progress:
        DateTime.fromISO(data.startDate) > DateTime.now()
          ? '?????????'
          : DateTime.fromISO(data.endDate) > DateTime.now()
          ? '?????????'
          : '??????',
      startDate: data.startDate,
      endDate: data.endDate,
      isStream: data.isStream,
    }));
    return mappingStudent;
  }

  async deleteStudent(id, user: User) {
    const result = await this.studentRepository.delete({ classId: id, user });
    if (result.affected === 0) {
      throw new NotFoundException('?????? ?????? ??????');
    }
    return { success: true, message: '?????? ?????? ??????' };
  }
  async updateStudentState(Dto, classid, userid, user) {
    const { isOk } = Dto;
    const teachClass = await this.classlistRepository.findOne({
      user,
      id: classid,
    });
    const studentlist = await this.studentRepository.findOne({
      userId: userid,
      classId: teachClass.id,
    });
    if (isOk == true) {
      const queryRunner = this.connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        studentlist.state = 'accepted';
        const student = await this.userRepository.findOne({ id: userid });
        const sendalarm = `${teachClass.title} ??????????????? ?????????????????????.`;
        await this.alarmRepository.createAlarm(student, sendalarm);
        await this.studentRepository.save(studentlist);
      } catch (e) {
        await queryRunner.rollbackTransaction();
        throw new ConflictException({ message: '???????????? ????????????????????????' });
      } finally {
        await queryRunner.release();
      }
    } else {
      const queryRunner = this.connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        await this.studentRepository.delete({ id: studentlist.id });
        const student = await this.userRepository.findOne({ id: userid });
        const sendalarm = `${teachClass.title} ??????????????? ?????????????????????.`;
        await this.alarmRepository.createAlarm(student, sendalarm);
      } catch (e) {
        await queryRunner.rollbackTransaction();
        throw new ConflictException({ message: '???????????? ????????????????????????' });
      } finally {
        await queryRunner.release();
      }
    }
    return { success: true, message: '???????????? ????????????' };
  }

  async checkClass(Dto) {
    const { uuid } = Dto;
    const classlist = await this.classlistRepository.findOne({ uuid });
    if (classlist) {
      return { isExist: true };
    } else {
      return { isExist: false };
    }
  }

  async OnAndOffAirClass(Dto, state) {
    const { uuid } = Dto;
    const classlist = await this.classlistRepository.findOne({ uuid });
    const id = classlist.id;
    if (state === 'on') {
      if (classlist.isStream === true) {
        return { success: false, message: '????????? ?????? ??????????????????.' };
      }
      await this.classlistRepository.update(id, { isStream: true });
      return { success: true, message: 'onAir ??????' };
    }
    if (state === 'off') {
      if (classlist.isStream === false) {
        return { success: false, message: '????????? ?????? ??????????????????.' };
      }
      await this.classlistRepository.update(id, { isStream: false });
      await this.chatRepository.softDelete({ classId: id });

      return { success: true, message: 'offAir & softDelete ??????' };
    }
  }

  async getStreamKey(id, user) {
    const key = await this.classlistRepository.findOne({ id, user });
    return { streamKey: key.uuid };
  }

  async getInviteCode(id, user) {
    const code = await this.classlistRepository.findOne({ id, user });

    return { inviteCode: await this.cipher(code.uuid, 'teamQue9929') };
  }

  cipher(password, key) {
    const encrypt = crypto.createCipher('des', key);
    const encryptResult =
      encrypt.update(password, 'utf8', 'base64') + encrypt.final('base64');
    return encryptResult;
  }

  decipher(password, key) {
    const decode = crypto.createDecipher('des', key);
    const decodeResult =
      decode.update(password, 'base64', 'utf8') + decode.final('utf8');
    return decodeResult;
  }
}
