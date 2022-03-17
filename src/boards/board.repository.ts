import { User } from 'src/auth/user.entity';
import { EntityRepository, Repository } from 'typeorm';
import { Board } from './board.entity';

@EntityRepository(Board)
export class BoardRepository extends Repository<Board> {
  async createBoard(Dto, user: User, classList): Promise<Board> {
    const { title, description, boardType } = Dto;
    const board = this.create({
      title,
      description,
      user,
      writer: user.username,
      boardType,
      class: classList,
    });
    await this.save(board);
    return board;
  }
}
