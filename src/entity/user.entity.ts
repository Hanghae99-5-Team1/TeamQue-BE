import { Exclude } from 'class-transformer';
import { Board } from 'src/entity/board.entity';
import { Comment } from 'src/entity/comment.entity';
import { Todo } from 'src/entity/todo.entity';
import { ClassList } from 'src/entity/class.entity';
import { Student } from 'src/entity/student.entity';
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
  userName: string;

  @Column({ nullable: true, default: null })
  password: string;

  @Column()
  userEmail: string;

  @Column({ nullable: true })
  provider: string;

  @Column({ default: '배움은 끝이 없다.', nullable: true })
  oneword: string;

  @Column({ nullable: true })
  @Exclude()
  currentHashedRefreshToken?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
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