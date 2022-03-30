import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from 'src/user/get-user.decorator';
import { JwtAuthGuard } from 'src/user/guards/jwt-auth.guard';
import { User } from 'src/entity/user.entity';
import { ClassList } from '../entity/class.entity';
import { ClassService } from './class.service';
import { CreateClassDto } from './dto/create-class.dto';
import { CreateDateDto } from './dto/create-date.dto';
import { GetAllDateByMonthDto } from './dto/get-dateAllByMonth.dto';
import { StudentStateDto } from './dto/studentState.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { UpdateDateDto } from './dto/update-date.dto';
import { CreateStudentDto } from './dto/create-student.dto';

@Controller('class')
@UseGuards(JwtAuthGuard)
export class ClassController {
  constructor(private classService: ClassService) {}
  //내가 듣는 수업 날짜만 가져오기
  @Get('/date')
  getClassDate(@GetUser() user: User, @Query() Query) {
    return this.classService.getAllClassDateByUser(
      user,
      Query.year,
      Query.month,
    );
  }
  //지정클레스의 수업날짜 가져오기
  @Get('/date/:classid')
  getclassdate(@Param('classid') id: number, @Query() Query) {
    return this.classService.getClassDate(id, Query.year, Query.month);
  }
  //지정클레스의 수업날짜 작성 (클레스의 time:string도 변경)
  @Post('/date/:classid')
  createClassDate(
    @Param('classid') id: number,
    @Body() Dto: CreateDateDto,
    @GetUser() user: User,
  ) {
    return this.classService.createClassDate(Dto, id, user);
  }
  //지정 날짜의 수업 일정 바꾸기
  @Put('/date/:classid/:classdateid')
  updateClassDate(
    @Param('classid') classid: number,
    @Param('classdateid') classdateid: number,
    @Body() Dto: UpdateDateDto,
    @GetUser() user: User,
  ) {
    return this.classService.updateClassDate(Dto, classid, classdateid, user);
  }
  //지정 클레스의 수업일정 전부삭제
  @Delete('/date/all/:classid')
  deleteAllClassDate(@Param('classid') classid: number, @GetUser() user: User) {
    return this.classService.deleteAllClassDate(classid, user);
  }
  //지정 날짜의 수업일정 삭제
  @Delete('/date/:classid/:classdateid')
  deleteClassDate(
    @Param('classid') classid: number,
    @Param('classdateid') classdateid: number,
    @GetUser() user: User,
  ) {
    return this.classService.deleteClassDate(classid, classdateid, user);
  }
  //학생의 수강신청
  @Post('/student')
  createStudent(@Body() Dto: CreateStudentDto, @GetUser() user: User) {
    return this.classService.createStudent(Dto, user);
  }
  //특정클레스를 듣는 학생 가져오기
  @Get('/student/:classid')
  getUserInStudent(@Param('classid') id: number) {
    return this.classService.getUserInStudent(id);
  }
  //수강 취소
  @Delete('/student/:classid')
  deleteStudent(@Param('classid') id: number, @GetUser() user: User) {
    return this.classService.deleteStudent(id, user);
  }
  //선생님의 수강신청 처리
  @Put('/student/:classid/:studentid')
  updateStudentState(
    @Param('studentid') studentid: number,
    @Param('classid') classid: number,
    @GetUser() user: User,
    @Body() Dto: StudentStateDto,
  ) {
    return this.classService.updateStudentState(Dto, classid, studentid, user);
  }
  //클레스만들기 (+ 클레스 일정)
  @Post('/')
  createClass(
    @Body() Dto: CreateClassDto,
    @GetUser() user: User,
  ): Promise<object> {
    return this.classService.createClass(Dto, user);
  }
  //내가하는 수업정보 가져오기
  @Get('/teach')
  getClass(@GetUser() user: User): Promise<object> {
    return this.classService.getClass(user);
  }
  //내가듣는 수업 가져오기
  @Get('/learn')
  getClassInStudent(@GetUser() user: User) {
    return this.classService.getClassInStudent(user);
  }
  //지정 클레스 정보 가져오기
  //Dto 확인
  @Get('/:classid')
  getSelectedClass(@Param('classid') id: number): Promise<object> {
    return this.classService.getSelectedClass(id);
  }
  //클레스 정보 수정(타이틀,url)
  @Put('/:classid')
  updateClass(
    @Param('classid') id: number,
    @Body() Dto: UpdateClassDto,
    @GetUser() user: User,
  ): Promise<object> {
    return this.classService.updateClass(Dto, id, user);
  }
  //클레스 삭제
  @Delete('/:classid')
  deleteClass(
    @Param('classid') id: number,
    @GetUser() user: User,
  ): Promise<object> {
    return this.classService.deleteClass(id, user);
  }
}
