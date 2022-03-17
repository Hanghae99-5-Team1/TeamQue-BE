import { Injectable, NotFoundException } from '@nestjs/common';
import { BoardRepository } from './board.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Board } from './board.entity';
import { User } from 'src/auth/user.entity';
import { CommentRepository } from './comment.repository';
import { Comment } from './comment.entity';
import { ClassService } from 'src/class/class.service';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(BoardRepository)
    private boardRepository: BoardRepository,
    private classService: ClassService,
    @InjectRepository(CommentRepository)
    private commentRepository: CommentRepository,
  ) {}

  // async getAllBoards(user: User): Promise<Board[]> {
  // const query = this.boardRepository.createQueryBuilder('board');

  // query.where('board.userId = :userId', { userId: user.id });

  // const boards = await query.getMany();
  // return boards;
  //   console.log(user['username']);
  //   return this.boardRepository.find();
  // }

  async createBoard(Dto, user: User, id): Promise<Board> {
    const classList = await this.classService.findClassById(id);
    return this.boardRepository.createBoard(Dto, user, classList);
  }

  async getBoardSelested(id: number) {
    const board = await this.boardRepository.findOne({ id });
    const comment: Comment[] = await board.comments;
    return board;
  }

  async getBoardByClassId(id: number): Promise<object> {
    const classList = await this.classService.findClassById(id);

    const boardListNotice = await this.boardRepository.find({
      class: classList,
      boardType: 'Notice',
    });
    const boardListquestion = await this.boardRepository.find({
      class: classList,
      boardType: 'Question',
    });

    return { boardListNotice, boardListquestion };
  }

  async deleteBoard(id: number, user: User): Promise<void> {
    const result = await this.boardRepository.delete({ id, user });
    if (result.affected === 0) {
      throw new NotFoundException(`Can't delete Board with id ${id}`);
    }
  }

  async updateBoard(Dto, user: User, id: number): Promise<Board> {
    const { title, description, boardType } = Dto;
    const board = await this.boardRepository.findOne({ id, user });
    board.title = title;
    board.description = description;
    board.boardType = boardType;
    await this.boardRepository.save(board);

    return board;
  }

  async createComment(Dto, user: User, id): Promise<Comment> {
    const board = await this.boardRepository.findOne({ id });
    return this.commentRepository.createCommnet(Dto, user, board);
  }

  async deleteComment(id, user: User): Promise<void> {
    const result = await this.commentRepository.delete({ id, user });
    if (result.affected === 0) {
      throw new NotFoundException(`Can't delete Comment with id ${id}`);
    }
  }

  async updateComment(Dto, user: User, id: number): Promise<Comment> {
    const { description } = Dto;
    const comment = await this.commentRepository.findOne({ id, user });
    comment.description = description;
    await this.commentRepository.save(comment);

    return comment;
  }
}
