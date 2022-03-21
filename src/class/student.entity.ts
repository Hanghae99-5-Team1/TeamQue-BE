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

@Entity({ orderBy: { state: 'ASC', id: 'ASC' } })
export class Student extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column()
  state: string;

  @Column({ nullable: true })
  userId: number;

  @Column()
  username: string;

  @Column({ nullable: true })
  classId: number;

  @ManyToOne((type) => ClassList, (classlist) => classlist.students, {
    onDelete: 'CASCADE',
    lazy: true,
  })
  class: ClassList;

  @ManyToOne((type) => User, (user) => user.studnets, { onDelete: 'CASCADE' })
  user: User;
}
