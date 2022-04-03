import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/entity/user.entity';
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
  @ApiProperty({ type: Number, description: 'student_id' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: Date, description: 'createdAt' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ type: Date, description: 'updatedAt' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: 'state' })
  @Column()
  state: 'accepted' | 'wait';

  @ApiProperty({ type: Number, description: 'userId' })
  @Column({ nullable: true })
  userId: number;

  @ApiProperty({ type: String, description: 'name' }) // 삭제
  @Column()
  name: string;

  @ApiProperty({ type: Number, description: 'classId' })
  @Column({ nullable: true })
  classId: number;

  @ManyToOne((type) => ClassList, (classlist) => classlist.students, {
    onDelete: 'CASCADE',
  })
  class: ClassList;

  @ManyToOne((type) => User, (user) => user.studnets, { onDelete: 'CASCADE' })
  user: User;
}
