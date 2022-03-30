import { BadRequestException } from '@nestjs/common';
import { User } from 'src/entity/user.entity';
import { EntityRepository, Repository } from 'typeorm';
import { Post } from '../entity/post.entity';
import { PostTypes } from '../post/model/postType.model';

@EntityRepository(Post)
export class PostRepository extends Repository<Post> {
  async createPost(Dto, user: User, classList): Promise<object> {
    const { title, content, postType } = Dto;
    if (!(postType in PostTypes)) {
      throw new BadRequestException('postType을 확인해주세요');
    }
    const board = this.create({
      title,
      content,
      user,
      author: user.name,
      postType,
      class: classList,
    });
    await this.save(board);
    return { success: true, message: '게시글작성 성공' };
  }
}
