import { User } from 'src/auth/user.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ClassList } from './class.entity';

@Entity()
export class Student extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  state: string;

  @Column({ nullable: true })
  userId: number;

  @Column()
  userName: string;

  @Column({ nullable: true })
  classId: number;

  @ManyToOne((type) => ClassList, (classlist) => classlist.students, {
    onDelete: 'CASCADE',
  })
  class: ClassList;

  @ManyToOne((type) => User, (user) => user.studnets, { onDelete: 'CASCADE' })
  user: User;
}
