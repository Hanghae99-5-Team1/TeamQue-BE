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
export class Post extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column()
  author: string;

  @Column()
  postType: 'Notice' | 'Question';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  userId: number;

  @Column({ nullable: true })
  classId: number;

  @OneToMany((type) => Comment, (comment) => comment.post, { lazy: true })
  comments: Comment[];

  @ManyToOne((type) => User, (user) => user.posts, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne((type) => ClassList, (classlist) => classlist.posts, {
    onDelete: 'CASCADE',
  })
  class: ClassList;
}
