import { User } from 'src/auth/user.entity';
import { EntityRepository, Repository } from 'typeorm';
import { Board } from './board.entity';
import { Comment } from './comment.entity';

@EntityRepository(Comment)
export class CommentRepository extends Repository<Comment> {
  async createCommnet(Dto, user: User, board: Board): Promise<Comment> {
    const { description } = Dto;
    const comment = this.create({
      description,
      user,
      board,
      writer: user.username,
    });
    await this.save(comment);
    return comment;
  }
}
