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

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ nullable: true })
  userId: number;

  @Column({ nullable: true })
  classId: number;

  @ManyToOne((type) => ClassList, (classlist) => classlist.students, {
    onDelete: 'CASCADE',
  })
  class: ClassList;

  @ManyToOne((type) => User, (user) => user.studnets, { onDelete: 'CASCADE' })
  user: User;
}
