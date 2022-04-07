import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/entity/user.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Alarm extends BaseEntity {
  @ApiProperty({ type: Number, description: 'alarm_id' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: Date, description: 'createdAt' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ type: String, description: 'message' })
  @Column()
  message: string;

  @ApiProperty({ type: Number, description: 'userId' })
  @Column({ nullable: true })
  userId: number;

  @ManyToOne((type) => User, (user) => user.alarms, { onDelete: 'CASCADE' })
  user: User;
}
