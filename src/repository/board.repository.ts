import { BadRequestException } from '@nestjs/common';
import { User } from 'src/entity/user.entity';
import { EntityRepository, Repository } from 'typeorm';
import { Board } from '../entity/board.entity';
import { BoardTypes } from '../boards/model/boardType.model';

@EntityRepository(Board)
export class BoardRepository extends Repository<Board> {
  async createBoard(Dto, user: User, classList): Promise<object> {
    const { title, description, boardType } = Dto;
    if (!(boardType in BoardTypes)) {
      throw new BadRequestException('보드타입을 확인해주세요');
    }
    const board = this.create({
      title,
      description,
      user,
      writer: user.userName,
      boardType,
      class: classList,
    });
    await this.save(board);
    return { success: true, message: '게시글작성 성공' };
  }
}
