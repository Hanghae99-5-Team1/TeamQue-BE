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
import { BoardsService } from './boards.service';
import { Board } from './board.entity';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Comment } from './comment.entity';

@Controller('boards')
@UseGuards(JwtAuthGuard)
export class BoardsController {
  constructor(private boardsService: BoardsService) {}

  // @Get('/')
  // getAllBoard(@GetUser() user: User): Promise<Board[]> {
  //   return this.boardsService.getAllBoards(user);
  // }

  @Post('/:classid')
  createBoard(
    @Param('classid') id: number,
    @Body() Dto,
    @GetUser() user: User,
  ): Promise<Board> {
    return this.boardsService.createBoard(Dto, user, id);
  }

  @Get('/:classid')
  getBoardByClassId(@Param('classid') id: number): Promise<object> {
    return this.boardsService.getBoardByClassId(id);
  }

  @Get('/board/:boardid')
  getBoardSelested(@Param('boardid') id: number) {
    return this.boardsService.getBoardSelested(id);
  }

  @Delete('/:boardid')
  deleteBoard(
    @Param('boardid') id: number,
    @GetUser() user: User,
  ): Promise<void> {
    return this.boardsService.deleteBoard(id, user);
  }

  @Put('/:boardid')
  updateBoard(
    @Param('boardid') id: number,
    @Body() Dto,
    @GetUser() user: User,
  ) {
    return this.boardsService.updateBoard(Dto, user, id);
  }

  @Post('/comment/:boardid')
  createComment(
    @Param('boardid') id: number,
    @Body() Dto,
    @GetUser() user: User,
  ): Promise<Comment> {
    return this.boardsService.createComment(Dto, user, id);
  }

  @Delete('/comment/:commentid')
  deleteComment(
    @Param('commnetid') id: number,
    @GetUser() user: User,
  ): Promise<void> {
    return this.boardsService.deleteComment(id, user);
  }

  @Put('/comment/:commentid')
  updateComment(
    @Param('commentid') id: number,
    @Body() Dto,
    @GetUser() user: User,
  ) {
    return this.boardsService.updateComment(Dto, user, id);
  }
}
