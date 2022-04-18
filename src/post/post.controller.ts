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
import { CreatePostDto } from '../dto/creat-post.dto';
import { CreateCommnetDto } from '../dto/creat-comment.dto';
import { CreateTodoDto } from '../dto/creat-todo.dto';
import { Todo } from '../entity/todo.entity';
import { isCompleteTodoDto } from '../dto/isComplete-todo.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@ApiBearerAuth('access-token')
@Controller('post')
@UseGuards(JwtAuthGuard)
export class PostController {
  constructor(private postService: PostService) {}

  //투두리스트 작성
  @ApiTags('post/todo')
  @Post('/todo')
  @ApiOperation({
    summary: '할일 메모 작성',
    description: '할일 메모 작성',
  })
  @ApiCreatedResponse({ description: '할일 메모 작성' })
  @ApiBody({ type: CreateTodoDto })
  createTodo(@Body() Dto: CreateTodoDto, @GetUser() user: User) {
    return this.postService.createTodo(Dto, user);
  }

  //투두리스트 가져오기
  @ApiTags('post/todo')
  @Get('/todo')
  @ApiOperation({
    summary: '할일 메모 가져오기',
    description: '할일 메모 가져오기',
  })
  @ApiOkResponse({ description: '할일 메모 가져오기' })
  getTodo(@GetUser() user: User): Promise<Todo[]> {
    return this.postService.getTodo(user);
  }

  //투두리스트 순서바꾸기
  // @Put('/todo/order')
  // @ApiTags('post/todo')
  // @ApiOperation({
  //   summary: '할일 메모 순서 바꾸기',
  //   description: '할일 메모 순서 바꾸기',
  // })
  // @ApiOkResponse({ description: '할일 메모 순서 바꾸기' })
  // @ApiBody({ type: changeOrderTodoDto })
  // changeOrderTodo(@Body() Dto: changeOrderTodoDto, @GetUser() user: User) {
  //   return this.postService.changeOrderTodo(Dto.to, Dto.from, user);
  // }

  //투두리스트 삭제
  @Delete('/todo/:todoid')
  @ApiTags('post/todo')
  @ApiOperation({
    summary: '할일 메모 삭제',
    description: '할일 메모 삭제',
  })
  @ApiOkResponse({ description: '할일 메모 삭제' })
  deleteTodo(
    @Param('todoid') id: number,
    @GetUser() user: User,
  ): Promise<object> {
    return this.postService.deleteTodo(id, user);
  }

  //투두리스트 상태 수정
  @Put('/todo/complete')
  @ApiTags('post/todo')
  @ApiOperation({
    summary: '할일 메모 상태 변경',
    description: '할일 메모 상태 변경',
  })
  @ApiOkResponse({ description: '할일 메모 상태 변경' })
  @ApiBody({ type: isCompleteTodoDto })
  updateTodo(@Body() Dto: isCompleteTodoDto): Promise<object> {
    return this.postService.updateTodoState(Dto.id);
  }

  //투두리스트 수정
  @Put('/todo/:todoid')
  @ApiTags('post/todo')
  @ApiOperation({
    summary: '할일 메모 수정',
    description: '할일 메모 수정',
  })
  @ApiOkResponse({ description: '할일 메모 수정' })
  @ApiBody({ type: CreateTodoDto })
  editTodo(
    @Param('todoid') id: number,
    @Body() Dto: CreateTodoDto,
    @GetUser() user: User,
  ): Promise<object> {
    return this.postService.updateTodo(id, user, Dto);
  }

  //댓글 작성
  @Post('/comment/:postid')
  @ApiTags('post/comment')
  @ApiOperation({
    summary: '댓글 작성',
    description: '댓글 작성',
  })
  @ApiCreatedResponse({ description: '댓글 작성' })
  @ApiBody({ type: CreateCommnetDto })
  createComment(
    @Param('postid') id: number,
    @Body() Dto: CreateCommnetDto,
    @GetUser() user: User,
  ): Promise<object> {
    return this.postService.createComment(Dto, user, id);
  }

  //댓글삭제
  @Delete('/comment/:commentid')
  @ApiTags('post/comment')
  @ApiOperation({
    summary: '댓글 삭제',
    description: '댓글 삭제',
  })
  @ApiOkResponse({ description: '댓글 삭제' })
  deleteComment(
    @Param('commentid') id: number,
    @GetUser() user: User,
  ): Promise<object> {
    return this.postService.deleteComment(id, user);
  }

  //댓글 수정
  @Put('/comment/:commentid')
  @ApiTags('post/comment')
  @ApiOperation({
    summary: '댓글 수정',
    description: '댓글 수정',
  })
  @ApiOkResponse({ description: '댓글 수정' })
  @ApiBody({ type: CreateCommnetDto })
  updateComment(
    @Param('commentid') id: number,
    @Body() Dto: CreateCommnetDto,
    @GetUser() user: User,
  ): Promise<object> {
    return this.postService.updateComment(Dto, user, id);
  }

  //특정게시글 가져오기
  @Get('/detail/:postid')
  @ApiTags('Post')
  @ApiOperation({
    summary: '게시글 한개 보기',
    description: '게시글 한개의 상세정보 및 댓글 보기',
  })
  @ApiOkResponse({ description: '게시글 한개의 상세정보 및 댓글 보기' })
  getPostSelested(@Param('postid') id: number): Promise<object> {
    return this.postService.getPostSelested(id);
  }

  //게시글 삭제
  @Delete('/:postid')
  @ApiTags('Post')
  @ApiOperation({
    summary: '게시글 삭제',
    description: '게시글 삭제',
  })
  @ApiOkResponse({ description: '게시글 삭제' })
  deletePost(
    @Param('postid') id: number,
    @GetUser() user: User,
  ): Promise<object> {
    return this.postService.deletePost(id, user);
  }

  //게시글 쓰기
  @Post('/:classid')
  @ApiTags('Post')
  @ApiOperation({
    summary: '게시글 쓰기',
    description: '해당 클레스에 게시글쓰기',
  })
  @ApiCreatedResponse({ description: '해당 클레스에 게시글쓰기' })
  @ApiBody({ type: CreatePostDto })
  createPost(
    @Param('classid') id: number,
    @Body() Dto: CreatePostDto,
    @GetUser() user: User,
  ): Promise<object> {
    return this.postService.createPost(Dto, user, id);
  }

  //해당 클레스의 게시글 가져오기
  @Get('/:classid')
  @ApiTags('Post')
  @ApiOperation({
    summary: '클레스 게시글 가져오기',
    description: '클레스 게시글 가져오기',
  })
  @ApiOkResponse({ description: '클레스 게시글 가져오기' })
  @ApiQuery({})
  getPostByClassId(
    @Param('classid') id: number,
    @Query() query,
  ): Promise<object> {
    return this.postService.getPostByClassId(id, query.page);
  }

  //게시글 수정
  @Put('/:postid')
  @ApiTags('Post')
  @ApiOperation({
    summary: '게시글 수정',
    description: '게시글 수정',
  })
  @ApiOkResponse({ description: '게시글 수정' })
  @ApiBody({ type: CreatePostDto })
  updatePost(
    @Param('postid') id: number,
    @Body() Dto: CreatePostDto,
    @GetUser() user: User,
  ): Promise<object> {
    return this.postService.updatePost(Dto, user, id);
  }
}
