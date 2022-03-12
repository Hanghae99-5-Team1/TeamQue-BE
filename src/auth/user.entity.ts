import { Board } from 'src/boards/board.entity';
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['username'])
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  // @Column()
  // password: string;

  @Column()
  userEmail: string;

  @Column()
  provider: string;

  @OneToMany((type) => Board, (board) => board.user, { eager: true })
  boards: Board[];
}
