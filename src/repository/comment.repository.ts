import { User } from 'src/entity/user.entity';
import { EntityRepository, Repository } from 'typeorm';
import { Board } from '../entity/board.entity';
import { Comment } from '../entity/comment.entity';
import { CreateCommnetDto } from '../boards/dto/creat-comment.dto';

@EntityRepository(Comment)
export class CommentRepository extends Repository<Comment> {
  async createCommnet(
    Dto: CreateCommnetDto,
    user: User,
    board: Board,
  ): Promise<object> {
    const { description } = Dto;
    const comment = this.create({
      description,
      user,
      board,
      writer: user.userName,
    });
    await this.save(comment);
    return { success: true, message: '댓글작성성공' };
  }
}
