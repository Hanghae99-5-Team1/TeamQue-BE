import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/entity/user.entity';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'todo', schema: 'public' })
export class Todo extends BaseEntity {
  @ApiProperty({ type: Number, description: 'todo_id' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: String, description: 'content' })
  @Column()
  content: string;

  @ApiProperty({ type: Boolean, description: 'isComplete' })
  @Column({ default: false })
  isComplete: boolean;

  @ApiProperty({ type: Number, description: 'order' })
  @Column()
  order: number;

  @ManyToOne((type) => User, (user) => user.todos, { onDelete: 'CASCADE' })
  user: User;
}
