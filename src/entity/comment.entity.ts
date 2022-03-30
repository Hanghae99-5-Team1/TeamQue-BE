import { User } from 'src/entity/user.entity';
import { Post } from './post.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @Column()
  author: string;

  @Column({ nullable: true })
  userId: number;

  @Column({ nullable: true })
  postId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne((type) => User, (user) => user.comments, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne((type) => Post, (post) => post.comments, {
    onDelete: 'CASCADE',
  })
  post: Post;
}
