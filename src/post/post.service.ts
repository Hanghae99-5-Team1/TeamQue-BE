import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entity/user.entity';
import { CommentRepository } from '../repository/comment.repository';
import { ClassService } from 'src/class/class.service';
import { Todo } from '../entity/todo.entity';
import { TodoRepository } from '../repository/todo.repository';
import { Connection } from 'typeorm';
import { PostTypes } from './model/postType.model';
import { PostRepository } from 'src/repository/post.repository';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostRepository)
    private postRepository: PostRepository,
    private classService: ClassService,
    @InjectRepository(CommentRepository)
    private commentRepository: CommentRepository,
    @InjectRepository(TodoRepository)
    private todoRepository: TodoRepository,
    private connection: Connection,
  ) {}

  async createPost(Dto, user: User, id): Promise<object> {
    const classList = await this.classService.findClassById(id);
    if (!classList) {
      throw new BadRequestException('강의가 없습니다');
    }
    return this.postRepository.createPost(Dto, user, classList);
  }

  async getPostSelested(id: number): Promise<object> {
    const post = await this.postRepository
      .createQueryBuilder('P')
      .select([
        'P.id',
        'P.title',
        'P.postType',
        'P.createdAt',
        'P.content',
        'P.userId',
        'U.name',
      ])
      .where('P.id = :id', { id })
      .leftJoin('P.user', 'U')
      // .leftJoinAndSelect('P.comments', 'C')
      // .leftJoin('C.user', 'U')
      .getOne();

    const comments = await this.commentRepository
      .createQueryBuilder('C')
      .select([
        'C.id',
        'C.content',
        'C.userId',
        'C.postId',
        'C.createdAt',
        'U.name',
      ])
      .where('C.postid = :postid', { postid: post.id })
      .leftJoin('C.user', 'U')
      .getMany();

    const mappingComment = comments.map((data) => ({
      id: data.id,
      content: data.content,
      userId: data.userId,
      postId: data.postId,
      createdAt: data.createdAt,
      author: data.user.name,
    }));
    return {
      id: post.id,
      title: post.title,
      postType: post.postType,
      createdAt: post.createdAt,
      content: post.content,
      userId: post.userId,
      author: post.user.name,
      comments: mappingComment,
    };
  }

  async getPostByClassId(id: number, page: number): Promise<object> {
    const classList = await this.classService.findClassById(id);

    const hardNotice = await this.postRepository
      .createQueryBuilder('P')
      .select(['P.id', 'P.title', 'U.name', 'P.postType', 'P.createdAt'])
      .leftJoin('P.user', 'U')
      .loadRelationCountAndMap('P.commentsCount', 'P.comments')
      .where('P.classid = :classid', { classid: classList.id })
      .andWhere('P.postType = :postType', { postType: 'Notice' })
      .take(10)
      .getMany();

    const notice = hardNotice.map((data: any) => ({
      id: data.id,
      title: data.title,
      author: data.user.name,
      postType: data.postType,
      createdAt: data.createdAt,
      commentCount: data.commentsCount,
    }));

    // .addSelect('COUNT(*) AS C')
    // .leftJoin('B.comments', 'C')
    if (!page) {
      page = 1;
    }
    const questionPage = 15 - hardNotice.length;
    const skipPage = questionPage * (page - 1);
    const postCountquestion = await this.postRepository.count({
      where: {
        class: classList,
        postType: 'Question',
      },
    });
    const pages = Math.ceil(postCountquestion / questionPage);
    const hardquestion = await this.postRepository
      .createQueryBuilder('P')
      .select(['P.id', 'P.title', 'P.postType', 'P.createdAt', 'U.name'])
      .leftJoin('P.user', 'U')
      .loadRelationCountAndMap('P.commentsCount', 'P.comments')
      .where('P.classid = :classid', { classid: classList.id })
      .andWhere('P.postType = :postType', { postType: 'Question' })
      .skip(skipPage)
      .take(questionPage)
      .getMany();

    const question = hardquestion.map((data: any) => ({
      id: data.id,
      title: data.title,
      author: data.user.name,
      postType: data.postType,
      createdAt: data.createdAt,
      commentCount: data.commentsCount,
    }));

    return { notice, question, pages };
  }

  async deletePost(id: number, user: User): Promise<object> {
    const result = await this.postRepository.delete({ id, user });
    if (result.affected === 0) {
      throw new NotFoundException('게시글 삭제 실패');
    }
    return { success: true, message: '게시글삭제성공' };
  }

  async updatePost(Dto, user: User, id: number): Promise<object> {
    const { title, content, postType } = Dto;
    if (!(postType in PostTypes)) {
      throw new BadRequestException('보드타입을 확인해주세요');
    }
    const post = await this.postRepository.findOne({ id, user });
    if (!post) {
      throw new BadRequestException('게시글이 없습니다');
    }
    post.title = title;
    post.content = content;
    post.postType = postType;
    await this.postRepository.save(post);

    return { success: true, message: '게시글수정성공' };
  }

  async createComment(Dto, user: User, id): Promise<object> {
    const post = await this.postRepository.findOne({ id });
    if (!post) {
      throw new BadRequestException('해당 게시글은 없습니다');
    }
    return this.commentRepository.createCommnet(Dto, user, post);
  }

  async deleteComment(id, user: User): Promise<object> {
    const result = await this.commentRepository.delete({ id, user });
    if (result.affected === 0) {
      throw new NotFoundException('댓글 삭제 실패');
    }
    return { success: true, message: '댓글 삭제 성공' };
  }

  async updateComment(Dto, user: User, id: number): Promise<object> {
    const { content } = Dto;
    const comment = await this.commentRepository.findOne({ id, user });
    if (!comment) {
      throw new BadRequestException('댓글이 없습니다');
    }
    comment.content = content;
    await this.commentRepository.save(comment);

    return { success: true, message: '댓글 수정 성공' };
  }

  async createTodo(Dto, user: User): Promise<object> {
    return await this.todoRepository.createtodo(Dto, user);
  }

  async getTodo(user: User): Promise<Todo[]> {
    return await this.todoRepository.find({ user });
  }

  async updateTodo(id, user, Dto) {
    const todo = await this.todoRepository.findOne({ id, user });
    const { content } = Dto;
    todo.content = content;
    await this.todoRepository.save(todo);
    return { success: true, message: '할일 수정 성공' };
  }

  async updateTodoState(id): Promise<object> {
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
