import { User } from 'src/entity/user.entity';
import { Post } from 'src/entity/post.entity';
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
import { ClassDate } from './classDate.entity';
import { Student } from './student.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class ClassList extends BaseEntity {
  @ApiProperty({ type: Number, description: 'class_id' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: String, description: 'title' })
  @Column()
  title: string;

  @ApiProperty({ type: String, description: 'timeTable' })
  @Column()
  timeTable: string;

  @ApiProperty({ type: String, description: 'startDate' })
  @Column()
  startDate: string;

  @ApiProperty({ type: String, description: 'endDate' })
  @Column()
  endDate: string;

  @ApiProperty({ type: String, description: 'imageUrl' })
  @Column({ type: 'text', nullable: true })
  imageUrl: string;

  @ApiProperty({ type: String, description: 'uuid' })
  @Column()
  @Index({ unique: true })
  uuid: string;

  @ApiProperty({ type: Boolean, description: 'stremNow' })
  @Column({ default: false })
  streamNow: boolean;

  @ApiProperty({ type: Number, description: 'userId' })
  @Column({ nullable: true })
  userId: number;

  @ApiProperty({ type: Date, description: 'createdAt' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ type: Date, description: 'updatedAt' })
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany((type) => Student, (student) => student.class, {
    cascade: true,
  })
  students: Student[];

  @OneToMany((type) => Post, (post) => post.class, {
    cascade: true,
  })
  posts: Post[];

  @OneToMany((type) => ClassDate, (classdate) => classdate.class, {
    cascade: true,
  })
  classdates: ClassDate[];

  @ManyToOne((type) => User, (user) => user.classes, { onDelete: 'CASCADE' })
  user: User;
}
