import { User } from 'src/entity/user.entity';
import { ClassList } from 'src/entity/class.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Comment } from './comment.entity';

@Entity({ orderBy: { createdAt: 'DESC', id: 'DESC' } })
export class Board extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  writer: string;

  @Column()
  boardType: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  userId: number;

  @Column({ nullable: true })
  classId: number;

  @OneToMany((type) => Comment, (comment) => comment.board, { lazy: true })
  comments: Comment[];

  @ManyToOne((type) => User, (user) => user.boards, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne((type) => ClassList, (classlist) => classlist.boards, {
    onDelete: 'CASCADE',
  })
  class: ClassList;
}
