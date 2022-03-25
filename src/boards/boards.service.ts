import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BoardRepository } from './board.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/user.entity';
import { CommentRepository } from './comment.repository';
import { ClassService } from 'src/class/class.service';
import { Todo } from './todo.entity';
import { TodoRepository } from './todo.repository';
import { Connection } from 'typeorm';
import { BoardTypes } from './model/boardType.model';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(BoardRepository)
    private boardRepository: BoardRepository,
    private classService: ClassService,
    @InjectRepository(CommentRepository)
    private commentRepository: CommentRepository,
    @InjectRepository(TodoRepository)
    private todoRepository: TodoRepository,
    private connection: Connection,
  ) {}

  async createBoard(Dto, user: User, id): Promise<object> {
    const classList = await this.classService.findClassById(id);
    return this.boardRepository.createBoard(Dto, user, classList);
  }

  async getBoardSelested(user: User, id: number): Promise<object> {
    const board = await this.boardRepository
      .createQueryBuilder('B')
      .select([
        'B.id',
        'B.title',
        'B.writer',
        'B.boardType',
        'B.createdAt',
        'B.description',
      ])
      .where('B.id = :id', { id })
      .leftJoinAndSelect('B.comments', 'C')
      .getOne();

    let isByMe = false;
    if (board.userId === user.id) {
      isByMe = true;
    }
    return { isByMe, board };
  }

  async getBoardByClassId(id: number, page: number): Promise<object> {
    const classList = await this.classService.findClassById(id);

    const boardListNotice = await this.boardRepository
      .createQueryBuilder('B')
      .select(['B.id', 'B.title', 'B.writer', 'B.boardType', 'B.createdAt'])
      .where('B.classid = :classid', { classid: classList.id })
      .andWhere('B.boardType = :boardType', { boardType: 'Notice' })
      .take(10)
      .getMany();

    // .addSelect('COUNT(*) AS C')
    // .leftJoin('B.comments', 'C')
    if (!page) {
      page = 1;
    }
    const questionPage = 20 - boardListNotice.length;
    const skipPage = questionPage * (page - 1);
    const boardCountquestion = await this.boardRepository.count({
      where: {
        class: classList,
        boardType: 'Question',
      },
    });
    const pages = Math.ceil(boardCountquestion / questionPage);
    const boardListquestion = await this.boardRepository
      .createQueryBuilder('B')
      .select(['B.id', 'B.title', 'B.writer', 'B.boardType', 'B.createdAt'])
      .where('B.classid = :classid', { classid: classList.id })
      .andWhere('B.boardType = :boardType', { boardType: 'Question' })
      .skip(skipPage)
      .take(questionPage)
      .getMany();

    return { boardListNotice, boardListquestion, pages };
  }

  async deleteBoard(id: number, user: User): Promise<object> {
    const result = await this.boardRepository.delete({ id, user });
    if (result.affected === 0) {
      throw new NotFoundException('게시글 삭제 실패');
    }
    return { success: true, message: '게시글삭제성공' };
  }

  async updateBoard(Dto, user: User, id: number): Promise<object> {
    const { title, description, boardType } = Dto;
    if (!(boardType in BoardTypes)) {
      throw new BadRequestException('보드타입을 확인해주세요');
    }
    const board = await this.boardRepository.findOne({ id, user });
    board.title = title;
    board.description = description;
    board.boardType = boardType;
    await this.boardRepository.save(board);

    return { success: true, message: '게시글수정성공' };
  }

  async createComment(Dto, user: User, id): Promise<object> {
    const board = await this.boardRepository.findOne({ id });
    return this.commentRepository.createCommnet(Dto, user, board);
  }

  async deleteComment(id, user: User): Promise<object> {
    const result = await this.commentRepository.delete({ id, user });
    if (result.affected === 0) {
      throw new NotFoundException('댓글 삭제 실패');
    }
    return { success: true, message: '댓글 삭제 성공' };
  }

  async updateComment(Dto, user: User, id: number): Promise<object> {
    const { description } = Dto;
    const comment = await this.commentRepository.findOne({ id, user });
    comment.description = description;
    await this.commentRepository.save(comment);

    return { success: true, message: '댓글 수정 성공' };
  }

  async createTodo(Dto, user: User): Promise<object> {
    return await this.todoRepository.createtodo(Dto, user);
  }

  async getTodo(user: User): Promise<Todo[]> {
    return await this.todoRepository.find({ user });
  }

  async updateTodo(id): Promise<object> {
    const state = await this.todoRepository.findOne({ id });
    if (state.isComplete === false) {
      state.isComplete = true;
    } else {
      state.isComplete = false;
    }
    await this.todoRepository.save(state);
    return { success: true, message: '할일 체크 성공' };
  }

  async deleteTodo(id, user: User): Promise<object> {
    const result = await this.todoRepository.delete({ id, user });
    if (result.affected === 0) {
      throw new NotFoundException('할일 삭제 실패');
    }
    return { success: true, message: '할일 삭제 성공' };
  }

  async changeOrderTodo(todoid1, todoid2, user) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const todo1 = await this.todoRepository.findOne({ id: todoid1, user });
      const todo2 = await this.todoRepository.findOne({ id: todoid2, user });
      const order = todo1.order;
      todo1.order = todo2.order;
      todo2.order = order;
      await this.todoRepository.save(todo1);
      await this.todoRepository.save(todo2);
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw new ConflictException({ message: '수정실패 다시시도해주세요' });
    } finally {
      await queryRunner.release();
      return { success: true, message: '할일 순서바꾸기 성공' };
    }
  }
}
