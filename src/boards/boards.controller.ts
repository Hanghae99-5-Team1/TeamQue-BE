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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { BoardsService } from './boards.service';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateBoardDto } from './dto/creat-board.dto';
import { CreateCommnetDto } from './dto/creat-comment.dto';
import { CreateTodoDto } from './dto/creat-todo.dto';
import { Todo } from './todo.entity';

@Controller('boards')
@UseGuards(JwtAuthGuard)
export class BoardsController {
  constructor(private boardsService: BoardsService) {}

  // @Get('/')
  // getAllBoard(@GetUser() user: User): Promise<Board[]> {
  //   return this.boardsService.getAllBoards(user);
  // }
  @Post('/todo')
  createTodo(@Body() Dto: CreateTodoDto, @GetUser() user: User) {
    return this.boardsService.createTodo(Dto, user);
  }

  @Get('/todo')
  getTodo(@GetUser() user: User): Promise<Todo[]> {
    return this.boardsService.getTodo(user);
  }

  @Put('/todo/change/:todoid1/:todoid2')
  changeOrderTodo(
    @Param('todoid1') todoid1,
    @Param('todoid2') todoid2,
    @GetUser() user: User,
  ) {
    return this.boardsService.changeOrderTodo(todoid1, todoid2, user);
  }

  @Delete('/todo/:todoid')
  deleteTodo(
    @Param('todoid') id: number,
    @GetUser() user: User,
  ): Promise<object> {
    return this.boardsService.deleteTodo(id, user);
  }

  @Put('/todo/:todoid')
  updateTodo(@Param('todoid') id: number): Promise<object> {
    return this.boardsService.updateTodo(id);
  }

  @Post('/comment/:boardid')
  createComment(
    @Param('boardid') id: number,
    @Body() Dto: CreateCommnetDto,
    @GetUser() user: User,
  ): Promise<object> {
    return this.boardsService.createComment(Dto, user, id);
  }

  @Delete('/comment/:commentid')
  deleteComment(
    @Param('commnetid') id: number,
    @GetUser() user: User,
  ): Promise<object> {
    return this.boardsService.deleteComment(id, user);
  }

  @Put('/comment/:commentid')
  updateComment(
    @Param('commentid') id: number,
    @Body() Dto: CreateCommnetDto,
    @GetUser() user: User,
  ): Promise<object> {
    return this.boardsService.updateComment(Dto, user, id);
  }

  @Get('/board/:boardid')
  getBoardSelested(
    @Param('boardid') id: number,
    @GetUser() user: User,
  ): Promise<object> {
    return this.boardsService.getBoardSelested(user, id);
  }

  @Delete('/:boardid')
  deleteBoard(
    @Param('boardid') id: number,
    @GetUser() user: User,
  ): Promise<object> {
    return this.boardsService.deleteBoard(id, user);
  }

  @Post('/:classid')
  @UsePipes(ValidationPipe)
  createBoard(
    @Param('classid') id: number,
    @Body() Dto: CreateBoardDto,
    @GetUser() user: User,
  ): Promise<object> {
    return this.boardsService.createBoard(Dto, user, id);
  }

  @Get('/:classid')
  getBoardByClassId(
    @Param('classid') id: number,
    @Query() query,
  ): Promise<object> {
    return this.boardsService.getBoardByClassId(id, query.page);
  }

  @Put('/:boardid')
  updateBoard(
    @Param('boardid') id: number,
    @Body() Dto: CreateBoardDto,
    @GetUser() user: User,
  ): Promise<object> {
    return this.boardsService.updateBoard(Dto, user, id);
  }
}
