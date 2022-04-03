import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { ClassModule } from 'src/class/class.module';
import { PostRepository } from '../repository/post.repository';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { CommentRepository } from '../repository/comment.repository';
import { TodoRepository } from '../repository/todo.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PostRepository,
      CommentRepository,
      TodoRepository,
    ]),
    UserModule,
    ClassModule,
  ],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
