import { User } from 'src/entity/user.entity';
import { ClassList } from 'src/entity/class.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Comment } from './comment.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ orderBy: { createdAt: 'DESC', id: 'DESC' } })
export class Post extends BaseEntity {
  @ApiProperty({ type: Number, description: 'post_id' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: String, description: 'title' })
  @Column()
  title: string;

  @ApiProperty({ type: String, description: 'content' })
  @Column({ type: 'text' })
  content: string;

  @ApiProperty({ description: 'postType' })
  @Column()
  postType: 'Notice' | 'Question';

  @ApiProperty({ type: Date, description: 'createdAt' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ type: Date, description: 'updatedAt' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ type: Number, description: 'userId' })
  @Column({ nullable: true })
  userId: number;

  @ApiProperty({ type: Number, description: 'classId' })
  @Column({ nullable: true })
  classId: number;

  @OneToMany((type) => Comment, (comment) => comment.post, {
    cascade: true,
  })
  comments: Comment[];

  @ManyToOne((type) => User, (user) => user.posts, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne((type) => ClassList, (classlist) => classlist.posts, {
    onDelete: 'CASCADE',
  })
  class: ClassList;
}
