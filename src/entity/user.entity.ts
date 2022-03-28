import { Exclude } from 'class-transformer';
import { Post } from 'src/entity/post.entity';
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
@Unique(['email'])
export class User extends BaseEntity {
  @PrimaryGeneratedColumn() //uuid??
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true, default: null })
  password: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  provider: string;

  @Column({ nullable: true })
  @Exclude()
  currentHashedRefreshToken?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany((type) => Post, (post) => post.user)
  posts: Post[];

  @OneToMany((type) => Todo, (todo) => todo.user)
  todos: Todo[];

  @OneToMany((type) => ClassList, (classlist) => classlist.user)
  classes: ClassList[];

  @OneToMany((type) => Student, (student) => student.user)
  studnets: Student[];

  @OneToMany((type) => Comment, (comment) => comment.user)
  comments: Comment[];
}
