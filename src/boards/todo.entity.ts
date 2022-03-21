import { User } from 'src/auth/user.entity';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Todo extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @Column({ default: false })
  isComplete: boolean;

  @Column()
  order: number;

  @ManyToOne((type) => User, (user) => user.todos, { onDelete: 'CASCADE' })
  user: User;
}
