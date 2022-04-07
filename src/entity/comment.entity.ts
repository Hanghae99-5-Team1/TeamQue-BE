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
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Comment extends BaseEntity {
  @ApiProperty({ type: Number, description: 'comment_id' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: String, description: 'content' })
  @Column()
  content: string;

  @ApiProperty({ type: Number, description: 'userId' })
  @Column({ nullable: true })
  userId: number;

  @ApiProperty({ type: Number, description: 'postId' })
  @Column({ nullable: true })
  postId: number;

  @ApiProperty({ type: Date, description: 'createdAt' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ type: Date, description: 'updatedAt' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne((type) => User, (user) => user.comments, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne((type) => Post, (post) => post.comments, {
    onDelete: 'CASCADE',
  })
  post: Post;
}
