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
import { ApiProperty } from '@nestjs/swagger';
import { Alarm } from './alarm.entity';

@Entity()
@Unique(['email'])
export class User extends BaseEntity {
  @ApiProperty({ type: Number, description: 'user_id' })
  @PrimaryGeneratedColumn() //uuid??
  id: number;

  @ApiProperty({ type: String, description: 'name' })
  @Column()
  name: string;

  @ApiProperty({ type: String, description: 'password' })
  @Column({ nullable: true, default: null })
  password: string;

  @ApiProperty({ type: String, description: 'email' })
  @Column()
  email: string;

  @ApiProperty({ type: String, description: 'provider' })
  @Column({ nullable: true })
  provider: string;

  @ApiProperty({ type: String, description: 'currentHashedRefreshToken' })
  @Column({ nullable: true, default: null })
  @Exclude()
  currentHashedRefreshToken?: string;

  @ApiProperty({ type: Date, description: 'createdAt' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ type: Date, description: 'updatedAt' })
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany((type) => Post, (post) => post.user)
  posts: Post[];

  @OneToMany((type) => Todo, (todo) => todo.user)
  todos: Todo[];

  @OneToMany((type) => ClassList, (classlist) => classlist.user, {
    cascade: true,
  })
  classes: ClassList[];

  @OneToMany((type) => Student, (student) => student.user, {
    cascade: true,
  })
  studnets: Student[];

  @OneToMany((type) => Comment, (comment) => comment.user, {
    cascade: true,
  })
  comments: Comment[];

  @OneToMany((type) => Alarm, (alarm) => alarm.user, {
    cascade: true,
  })
  alarms: Alarm[];
}
