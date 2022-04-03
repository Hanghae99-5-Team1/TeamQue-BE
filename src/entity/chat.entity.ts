import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({ type: Number, description: 'chat_id' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: Number, description: 'classId' })
  @Column()
  classId: number;

  @ApiProperty({ type: Number, description: 'userId' })
  @Column()
  userId: number;

  @ApiProperty({ type: String, description: 'userName' })
  @Column()
  userName: string;

  @ApiProperty({ type: String, description: 'content' })
  @Column()
  content: string;

  @ApiProperty({ type: Boolean, description: 'isResolved' })
  @Column()
  isResolved: boolean;

  @ApiProperty({ type: Number, description: 'like' })
  @Column()
  like: number;

  @ApiProperty({ type: String, description: 'uuid' })
  @Column()
  uuid: string;

  @ApiProperty({ type: Number, description: 'type' })
  @Column()
  type: number;

  @ApiProperty({ type: Number, description: 'createdAt' })
  @CreateDateColumn({ name: 'create_at' })
  createdAt: Date;

  @ApiProperty({ type: Date, description: 'deletedAt' })
  @DeleteDateColumn({ name: 'delete_at' })
  deletedAt?: Date | null;

  @OneToMany((type) => Like, (like) => like.chat)
  likes: Like[];
}
