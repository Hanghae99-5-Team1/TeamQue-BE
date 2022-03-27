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
export class ClassDate extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  year: string;

  @Column()
  month: string;

  @Column()
  day: string;

  @Column()
  time: string;

  @Column({ nullable: true })
  classId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne((type) => ClassList, (classlist) => classlist.classdates, {
    onDelete: 'CASCADE',
  })
  class: ClassList;
}
