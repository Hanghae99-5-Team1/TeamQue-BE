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
import { ClassService } from './class.service';
import { CreateClassDto } from './dto/create-class.dto';
import { CreateDateDto } from './dto/create-date.dto';
import { StudentStateDto } from './dto/studentState.dto';
import { UpdateDateDto } from './dto/update-date.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiBearerAuth('access-token')
@Controller('class')
@UseGuards(JwtAuthGuard)
export class ClassController {
  constructor(private classService: ClassService) {}

  //내가 듣는 수업 날짜만 가져오기
  @ApiTags('Class/date')
  @Get('/date')
  @ApiOperation({
    summary: '나의 수업 달력',
    description: '내가 듣는 수업 날짜 가져오기',
  })
  @ApiOkResponse({ description: '내가 듣는 수업 날짜 가져오기' })
  getClassDate(@GetUser() user: User, @Query() Query) {
    return this.classService.getAllClassDateByUser(
      user,
      Query.year,
      Query.month,
    );
  }

  //지정클레스의 수업날짜 가져오기
  @Get('/date/:classid')
  @ApiTags('Class/date')
  @ApiOperation({
    summary: '수업 달력',
    description: '클레스의 수업날짜 가져오기',
  })
  @ApiOkResponse({ description: '클레스의 수업날짜 가져오기' })
  getclassdate(@Param('classid') id: number, @Query() Query) {
    return this.classService.getClassDate(id, Query.year, Query.month);
  }

  //지정클레스의 수업날짜 작성 (클레스의 time:string도 변경)
  @Post('/date/:classid')
  @ApiTags('Class/date')
  @ApiOperation({
    summary: '수업 일정 설정하기',
    description: '수업 일정을 넣어 달력에 표시할수있다.',
  })
  @ApiCreatedResponse({ description: '수업 일정 설정하기' })
  @ApiBody({ type: CreateDateDto })
  createClassDate(
    @Param('classid') id: number,
    @Body() Dto: CreateDateDto,
    @GetUser() user: User,
  ) {
    return this.classService.createClassDate(Dto, id, user);
  }

  //지정 날짜의 수업 일정 바꾸기
  @Put('/date/:classid/:classdateid')
  @ApiTags('Class/date')
  @ApiOperation({
    summary: '수업 일정 변경하기',
    description: '수업 일정 하루를 변경할수있다',
  })
  @ApiOkResponse({ description: '수업 일정 하루를 변경할수있다' })
  @ApiBody({ type: UpdateDateDto })
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
  @ApiTags('Class/date')
  @ApiOperation({
    summary: '수업 일정 전부삭제',
    description: '수업 일정을 전부 삭제한다',
  })
  @ApiOkResponse({ description: '수업 일정을 전부 삭제한다' })
  deleteAllClassDate(@Param('classid') classid: number, @GetUser() user: User) {
    return this.classService.deleteAllClassDate(classid, user);
  }
  //지정 날짜의 수업일정 삭제
  @Delete('/date/:classid/:classdateid')
  @ApiTags('Class/date')
  @ApiOperation({
    summary: '수업 일정 삭제',
    description: '수업 일정 하루를 삭제한다',
  })
  @ApiOkResponse({ description: '수업 일정 하루를 삭제한다' })
  deleteClassDate(
    @Param('classid') classid: number,
    @Param('classdateid') classdateid: number,
    @GetUser() user: User,
  ) {
    return this.classService.deleteClassDate(classid, classdateid, user);
  }

  //학생의 수강신청
  @Post('/student')
  @ApiTags('Class/student')
  @ApiOperation({
    summary: '학생의 수강신청',
    description: 'uuid를 통해 수강신청을할수있다',
  })
  @ApiCreatedResponse({ description: 'uuid를 통해 수강신청을할수있다' })
  @ApiBody({ type: CreateStudentDto })
  createStudent(@Body() Dto: CreateStudentDto, @GetUser() user: User) {
    return this.classService.createStudent(Dto, user);
  }

  //특정클레스를 듣는 학생 가져오기
  @Get('/student/:classid')
  @ApiTags('Class/student')
  @ApiOperation({
    summary: '수강하는 학생가져오기',
    description: '선택한 클래스의 수강생을 알수있다',
  })
  @ApiOkResponse({ description: '선택한 클래스의 수강생을 알수있다' })
  getUserInStudent(@Param('classid') id: number) {
    return this.classService.getUserInStudent(id);
  }

  //수강 취소
  @Delete('/student/:classid')
  @ApiTags('Class/student')
  @ApiOperation({
    summary: '수강 취소',
    description: '클레스 수강을 취소한다',
  })
  @ApiOkResponse({ description: '클레스 수강을 취소한다' })
  deleteStudent(@Param('classid') id: number, @GetUser() user: User) {
    return this.classService.deleteStudent(id, user);
  }

  //선생님의 수강신청 처리
  @Put('/student/:classid/:userid')
  @ApiTags('Class/student')
  @ApiOperation({
    summary: '수강 신청 처리',
    description: '수강신청한 학생을 수락하거나 거절한 후 알람을보낸다',
  })
  @ApiOkResponse({
    description: '수강신청한 학생을 수락하거나 거절한 후 알람을보낸다',
  })
  @ApiBody({ type: StudentStateDto })
  updateStudentState(
    @Param('userid') userid: number,
    @Param('classid') classid: number,
    @GetUser() user: User,
    @Body() Dto: StudentStateDto,
  ) {
    return this.classService.updateStudentState(Dto, classid, userid, user);
  }

  //클레스만들기 (+ 클레스 일정)
  @Post('/')
  @ApiTags('Class')
  @ApiOperation({
    summary: '클레스 만들기',
    description: '클레스 만들기',
  })
  @ApiCreatedResponse({ description: '클레스 만들기' })
  @ApiBody({ type: CreateClassDto })
  createClass(
    @Body() Dto: CreateClassDto,
    @GetUser() user: User,
  ): Promise<object> {
    return this.classService.createClass(Dto, user);
  }

  //내가하는 수업정보 가져오기
  @Get('/teach')
  @ApiTags('Class')
  @ApiOperation({
    summary: '내가 가르치는 클레스',
    description: '내가 만든 클레스를 알수있다',
  })
  @ApiOkResponse({ description: '내가 만든 클레스를 알수있다' })
  getClass(@GetUser() user: User): Promise<object> {
    return this.classService.getClass(user);
  }

  //클레스 초대코드 받기
  @Get('/invitecode/:classid')
  @ApiTags('Class')
  @ApiOperation({
    summary: '클레스 초대코드 받기',
    description: '클레스 초대코드 받기',
  })
  @ApiOkResponse({ description: '클레스 초대코드 받기' })
  getInviteCode(@Param('classid') id: string, @GetUser() user: User) {
    return this.classService.getInviteCode(id, user);
  }

  //내가듣는 수업 가져오기
  @Get('/learn')
  @ApiTags('Class')
  @ApiOperation({
    summary: '내가 신청한 클레스',
    description: '내가 듣는 클레스를 알수있다',
  })
  @ApiOkResponse({ description: '내가 듣는 클레스를 알수있다' })
  getClassInStudent(@GetUser() user: User) {
    return this.classService.getClassInStudent(user);
  }

  //지정 클레스 정보 가져오기
  @Get('/:classid')
  @ApiTags('Class')
  @ApiOperation({
    summary: '클레스 정보',
    description: '클레스의 정보를 알수있다',
  })
  @ApiOkResponse({ description: '클레스의 정보를 알수있다' })
  getSelectedClass(
    @Param('classid') id: number,
    @GetUser() user: User,
  ): Promise<object> {
    return this.classService.getSelectedClass(id, user);
  }

  //클레스 정보 수정
  @Put('/:classid')
  @ApiTags('Class')
  @ApiOperation({
    summary: '클레스 정보 수정',
    description: '클레스의 정보를 수정 할수있다',
  })
  @ApiOkResponse({
    description: '클레스의 정보를 수정 할수있다',
  })
  @ApiBody({ type: CreateClassDto })
  updateClass(
    @Param('classid') id: number,
    @Body() Dto: CreateClassDto,
    @GetUser() user: User,
  ): Promise<object> {
    return this.classService.updateClass(Dto, id, user);
  }

  //클레스 삭제
  @Delete('/:classid')
  @ApiTags('Class')
  @ApiOperation({
    summary: '클레스 삭제',
    description: '내가만든 클레스를 삭제한다',
  })
  @ApiOkResponse({ description: '내가만든 클레스를 삭제한다' })
  deleteClass(
    @Param('classid') id: number,
    @GetUser() user: User,
  ): Promise<object> {
    return this.classService.deleteClass(id, user);
  }
}
