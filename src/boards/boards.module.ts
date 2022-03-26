import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { ClassModule } from 'src/class/classes.module';
import { BoardRepository } from '../repository/board.repository';
import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';
import { CommentRepository } from '../repository/comment.repository';
import { TodoRepository } from '../repository/todo.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BoardRepository,
      CommentRepository,
      TodoRepository,
    ]),
    AuthModule,
    ClassModule,
  ],
  controllers: [BoardsController],
  providers: [BoardsService],
})
export class BoardsModule {}
