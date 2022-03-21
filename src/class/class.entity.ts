import { User } from 'src/auth/user.entity';
import { Board } from 'src/boards/board.entity';
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
  time: string;

  @Column()
  teacher: string;

  @Column({ type: 'text', nullable: true })
  imageUrl?: string;

  @Column({ nullable: true })
  userId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany((type) => Student, (student) => student.class)
  students: Student[];

  @OneToMany((type) => Board, (board) => board.class)
  boards: Board[];

  @OneToMany((type) => ClassDate, (classdate) => classdate.class, {
    lazy: true,
  })
  classdates: ClassDate[];

  @ManyToOne((type) => User, (user) => user.classes, { onDelete: 'CASCADE' })
  user: User;
}
