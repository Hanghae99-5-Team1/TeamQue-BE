import { Exclude } from 'class-transformer';
import { Board } from 'src/boards/board.entity';
import { Comment } from 'src/boards/comment.entity';
import { Todo } from 'src/boards/todo.entity';
import { ClassList } from 'src/class/class.entity';
import { Student } from 'src/class/student.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
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
  oneword: string;

  @Column({ nullable: true })
  @Exclude()
  currentHashedRefreshToken?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany((type) => Board, (board) => board.user)
  boards: Board[];

  @OneToMany((type) => Todo, (todo) => todo.user)
  todos: Todo[];

  @OneToMany((type) => ClassList, (classlist) => classlist.user)
  classes: ClassList[];

  @OneToMany((type) => Student, (student) => student.user)
  studnets: Student[];

  @OneToMany((type) => Comment, (comment) => comment.user)
  comments: Comment[];
}
