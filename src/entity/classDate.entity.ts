import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ClassList } from './class.entity';

@Entity()
export class ClassDate extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  year: number;

  @Column()
  month: number;

  @Column()
  day: number;

  @Column()
  startTime: string;

  @Column()
  endTime: string;

  @Column()
  weekday: number;

  @Column({ nullable: true })
  classId: number;

  @ManyToOne((type) => ClassList, (classlist) => classlist.classdates, {
    onDelete: 'CASCADE',
  })
  class: ClassList;
}
