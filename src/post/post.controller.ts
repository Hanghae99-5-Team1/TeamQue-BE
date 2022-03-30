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
import { PostService } from './post.service';
import { GetUser } from 'src/user/get-user.decorator';
import { User } from 'src/entity/user.entity';
import { JwtAuthGuard } from 'src/user/guards/jwt-auth.guard';
import { CreatePostDto } from './dto/creat-post.dto';
import { CreateCommnetDto } from './dto/creat-comment.dto';
import { CreateTodoDto } from './dto/creat-todo.dto';
import { Todo } from '../entity/todo.entity';
import { changeOrderTodoDto } from './dto/changeOrder-todo.dto';
import { isCompleteTodoDto } from './dto/isComplete-todo.dto';

@Controller('post')
@UseGuards(JwtAuthGuard)
export class PostController {
  constructor(private postService: PostService) {}
  //투두리스트 작성
  @Post('/todo')
  createTodo(@Body() Dto: CreateTodoDto, @GetUser() user: User) {
    return this.postService.createTodo(Dto, user);
  }
  //투두리스트 가져오기
  @Get('/todo')
  getTodo(@GetUser() user: User): Promise<Todo[]> {
    return this.postService.getTodo(user);
  }
  //투두리스트 순서바꾸기
  @Put('/todo/order')
  changeOrderTodo(@Body() Dto: changeOrderTodoDto, @GetUser() user: User) {
    return this.postService.changeOrderTodo(Dto.to, Dto.from, user);
  }
  //투두리스트 삭제
  @Delete('/todo/:todoid')
  deleteTodo(
    @Param('todoid') id: number,
    @GetUser() user: User,
  ): Promise<object> {
    return this.postService.deleteTodo(id, user);
  }
  //투두리스트 상태 수정
  @Put('/todo/complete')
  updateTodo(@Body() Dto: isCompleteTodoDto): Promise<object> {
    return this.postService.updateTodoState(Dto.id);
  }

  //투두리스트 수정
  @Delete('/todo/:todoid')
  editTodo(
    @Param('todoid') id: number,
    @Body() Dto: CreateTodoDto,
    @GetUser() user: User,
  ): Promise<object> {
    return this.postService.updateTodo(id, user, Dto);
  }

  //댓글 작성
  @Post('/comment/:postid')
  createComment(
    @Param('postid') id: number,
    @Body() Dto: CreateCommnetDto,
    @GetUser() user: User,
  ): Promise<object> {
    return this.postService.createComment(Dto, user, id);
  }
  //댓글삭제
  @Delete('/comment/:commentid')
  deleteComment(
    @Param('commnetid') id: number,
    @GetUser() user: User,
  ): Promise<object> {
    return this.postService.deleteComment(id, user);
  }
  //댓글 수정
  @Put('/comment/:commentid')
  updateComment(
    @Param('commentid') id: number,
    @Body() Dto: CreateCommnetDto,
    @GetUser() user: User,
  ): Promise<object> {
    return this.postService.updateComment(Dto, user, id);
  }
  //특정게시글 가져오기
  @Get('/detail/:postid')
  getPostSelested(
    @Param('postid') id: number,
    @GetUser() user: User,
  ): Promise<object> {
    return this.postService.getPostSelested(user, id);
  }
  //게시글 삭제
  @Delete('/:postid')
  deletePost(
    @Param('postid') id: number,
    @GetUser() user: User,
  ): Promise<object> {
    return this.postService.deletePost(id, user);
  }
  //게시글 쓰기
  @Post('/:classid')
  createPost(
    @Param('classid') id: number,
    @Body() Dto: CreatePostDto,
    @GetUser() user: User,
  ): Promise<object> {
    return this.postService.createPost(Dto, user, id);
  }
  //해당 클레스의 게시글 가져오기
  @Get('/:classid')
  getPostByClassId(
    @Param('classid') id: number,
    @Query() query,
  ): Promise<object> {
    return this.postService.getPostByClassId(id, query.page);
  }
  //게시글 수정
  @Put('/:postid')
  updatePost(
    @Param('postid') id: number,
    @Body() Dto: CreatePostDto,
    @GetUser() user: User,
  ): Promise<object> {
    return this.postService.updatePost(Dto, user, id);
  }
}
