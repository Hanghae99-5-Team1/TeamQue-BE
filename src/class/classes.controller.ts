import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from 'src/auth/get-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/auth/user.entity';
import { ClassList } from './class.entity';
import { ClassService } from './class.service';
import { CreateClassDto } from './dto/create-class.dto';

@Controller('class')
@UseGuards(JwtAuthGuard)
export class ClassController {
  constructor(private classService: ClassService) {}

  @Get('/date/:classid')
  getclassdate(@Param('classid') id: number) {
    return this.classService.getClassDate(id);
  }

  @Post('/date/:classid')
  createClassDate(
    @Param('classid') id: number,
    @Body() Dto,
    @GetUser() user: User,
  ) {
    return this.classService.createClassDate(Dto, id, user);
  }

  @Put('/date/:classid/:classdateid')
  updateClassDate(
    @Param('classid') classid: number,
    @Param('classdateid') classdateid: number,
    @Body() Dto,
    @GetUser() user: User,
  ) {
    return this.classService.updateClassDate(Dto, classid, classdateid, user);
  }

  @Delete('/date/:classid/:classdateid')
  deleteClassDate(
    @Param('classid') classid: number,
    @Param('classdateid') classdateid: number,
    @GetUser() user: User,
  ) {
    return this.classService.deleteClassDate(classid, classdateid, user);
  }

  @Post('/student/:classid')
  createStudent(@Param('classid') id: number, @GetUser() user: User) {
    return this.classService.createStudent(id, user);
  }

  @Get('/student/class')
  getClassInStudent(@GetUser() user: User) {
    return this.classService.getClassInStudent(user);
  }
  @Get('/student/:classid')
  getUserInStudent(@Param('classid') id: number) {
    return this.classService.getUserInStudent(id);
  }

  @Delete('/student/:studentid')
  deleteStudent(@Param('studentid') id: number, @GetUser() user: User) {
    return this.classService.deleteStudent(id, user);
  }

  @Post('/')
  createClass(
    @Body() Dto: CreateClassDto,
    @GetUser() user: User,
  ): Promise<object> {
    return this.classService.createClass(Dto, user);
  }

  @Get('/')
  getClass(@GetUser() user: User): Promise<ClassList[]> {
    return this.classService.getClass(user);
  }

  @Get('/:classid')
  getSelectedClass(
    @GetUser() user: User,
    @Param('classid') id: number,
  ): Promise<object> {
    return this.classService.getSelectedClass(id, user);
  }

  @Put('/:classid')
  updateClass(
    @Param('classid') id: number,
    @Body() Dto: CreateClassDto,
    @GetUser() user: User,
  ): Promise<object> {
    return this.classService.updateClass(Dto, id, user);
  }

  @Delete('/:classid')
  deleteClass(
    @Param('classid') id: number,
    @GetUser() user: User,
  ): Promise<object> {
    return this.classService.deleteClass(id, user);
  }
}
