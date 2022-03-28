import { User } from 'src/entity/user.entity';
import { Post } from 'src/entity/post.entity';
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
import { ClassDate } from './classDate.entity';
import { Student } from './student.entity';

@Entity()
export class ClassList extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  timeTable: string;

  @Column()
  teacher: string;

  @Column()
  startDate: string;

  @Column()
  endDate: string;

  @Column({ type: 'text', nullable: true })
  imageUrl: string;

  @Column()
  uuid: string;

  @Column({ nullable: true })
  userId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany((type) => Student, (student) => student.class)
  students: Student[];

  @OneToMany((type) => Post, (post) => post.class)
  posts: Post[];

  @OneToMany((type) => ClassDate, (classdate) => classdate.class)
  classdates: ClassDate[];

  @ManyToOne((type) => User, (user) => user.classes, { onDelete: 'CASCADE' })
  user: User;
}
