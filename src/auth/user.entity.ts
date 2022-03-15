import { Exclude } from 'class-transformer';
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
@Unique(['userEmail'])
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column({ nullable: true, default: null })
  password: string;

  @Column()
  userEmail: string;

  @Column({ nullable: true })
  provider: string;

  @Column({ nullable: true })
  @Exclude()
  currentHashedRefreshToken?: string;

  @OneToMany((type) => Board, (board) => board.user, { eager: true })
  boards: Board[];
}
