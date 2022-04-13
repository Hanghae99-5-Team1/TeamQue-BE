import { ApiProperty } from '@nestjs/swagger';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ClassList } from './class.entity';

@Entity({ name: 'classdate', schema: 'public' })
export class ClassDate extends BaseEntity {
  @ApiProperty({ type: Number, description: 'classDate_id' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: Number, description: 'year' })
  @Column()
  year: number;

  @ApiProperty({ type: Number, description: 'month' })
  @Column()
  month: number;

  @ApiProperty({ type: Number, description: 'day' })
  @Column()
  day: number;

  @ApiProperty({ type: String, description: 'startTime' })
  @Column()
  startTime: string;

  @ApiProperty({ type: String, description: 'endTime' })
  @Column()
  endTime: string;

  @ApiProperty({ type: Number, description: 'weekday' })
  @Column()
  weekday: number;

  @ApiProperty({ type: Number, description: 'classId' })
  @Column({ nullable: true })
  classId: number;

  @ManyToOne((type) => ClassList, (classlist) => classlist.classdates, {
    onDelete: 'CASCADE',
  })
  class: ClassList;
}
