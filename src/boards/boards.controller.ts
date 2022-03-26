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
import { BoardsService } from './boards.service';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/entity/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateBoardDto } from './dto/creat-board.dto';
import { CreateCommnetDto } from './dto/creat-comment.dto';
import { CreateTodoDto } from './dto/creat-todo.dto';
import { Todo } from '../entity/todo.entity';

@Controller('boards')
@UseGuards(JwtAuthGuard)
export class BoardsController {
  constructor(private boardsService: BoardsService) {}
  //투두리스트 작성
  @Post('/todo')
  createTodo(@Body() Dto: CreateTodoDto, @GetUser() user: User) {
    return this.boardsService.createTodo(Dto, user);
  }
  //투두리스트 가져오기
  @Get('/todo')
  getTodo(@GetUser() user: User): Promise<Todo[]> {
    return this.boardsService.getTodo(user);
  }
  //투두리스트 순서바꾸기
  //트렌젝션 검토필
  @Put('/todo/change/:todoid1/:todoid2')
  changeOrderTodo(
    @Param('todoid1') todoid1: number,
    @Param('todoid2') todoid2: number,
    @GetUser() user: User,
  ) {
    return this.boardsService.changeOrderTodo(todoid1, todoid2, user);
  }
  //투두리스트 삭제
  @Delete('/todo/:todoid')
  deleteTodo(
    @Param('todoid') id: number,
    @GetUser() user: User,
  ): Promise<object> {
    return this.boardsService.deleteTodo(id, user);
  }
  //투두리스트 상태 수정
  @Put('/todo/:todoid')
  updateTodo(@Param('todoid') id: number): Promise<object> {
    return this.boardsService.updateTodo(id);
  }
  //댓글 작성
  @Post('/comment/:boardid')
  createComment(
    @Param('boardid') id: number,
    @Body() Dto: CreateCommnetDto,
    @GetUser() user: User,
  ): Promise<object> {
    return this.boardsService.createComment(Dto, user, id);
  }
  //댓글삭제
  @Delete('/comment/:commentid')
  deleteComment(
    @Param('commnetid') id: number,
    @GetUser() user: User,
  ): Promise<object> {
    return this.boardsService.deleteComment(id, user);
  }
  //댓글 수정
  @Put('/comment/:commentid')
  updateComment(
    @Param('commentid') id: number,
    @Body() Dto: CreateCommnetDto,
    @GetUser() user: User,
  ): Promise<object> {
    return this.boardsService.updateComment(Dto, user, id);
  }
  //특정게시글 가져오기
  @Get('/board/:boardid')
  getBoardSelested(
    @Param('boardid') id: number,
    @GetUser() user: User,
  ): Promise<object> {
    return this.boardsService.getBoardSelested(user, id);
  }
  //게시글 삭제
  @Delete('/:boardid')
  deleteBoard(
    @Param('boardid') id: number,
    @GetUser() user: User,
  ): Promise<object> {
    return this.boardsService.deleteBoard(id, user);
  }
  //게시글 쓰기
  @Post('/:classid')
  createBoard(
    @Param('classid') id: number,
    @Body() Dto: CreateBoardDto,
    @GetUser() user: User,
  ): Promise<object> {
    return this.boardsService.createBoard(Dto, user, id);
  }
  //해당 클레스의 게시글 가져오기
  @Get('/:classid')
  getBoardByClassId(
    @Param('classid') id: number,
    @Query() query,
  ): Promise<object> {
    return this.boardsService.getBoardByClassId(id, query.page);
  }
  //게시글 수정
  @Put('/:boardid')
  updateBoard(
    @Param('boardid') id: number,
    @Body() Dto: CreateBoardDto,
    @GetUser() user: User,
  ): Promise<object> {
    return this.boardsService.updateBoard(Dto, user, id);
  }
}
