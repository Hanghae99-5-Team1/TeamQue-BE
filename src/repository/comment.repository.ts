import { User } from 'src/entity/user.entity';
import { EntityRepository, Repository } from 'typeorm';
import { Post } from '../entity/post.entity';
import { Comment } from '../entity/comment.entity';
import { CreateCommnetDto } from '../post/dto/creat-comment.dto';

@EntityRepository(Comment)
export class CommentRepository extends Repository<Comment> {
  async createCommnet(
    Dto: CreateCommnetDto,
    user: User,
    post: Post,
  ): Promise<object> {
    const { content } = Dto;
    const comment = this.create({
      content,
      user,
      post,
    });
    await this.save(comment);
    return { success: true, message: '댓글작성성공' };
  }
}
