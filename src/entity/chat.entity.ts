import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Like } from './like.entity';

@Entity()
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  classId: number;

  @Column()
  userId: number;

  @Column()
  userName: string;

  @Column()
  content: string;

  @Column()
  isResolved: boolean;

  @Column()
  like: number;

  @Column()
  uuid: string;

  @Column()
  type: number;

  @CreateDateColumn({ name: 'create_at' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'delete_at' })
  deletedAt?: Date | null;

  @OneToMany((type) => Like, (like) => like.chat)
  likes: Like[];
}
