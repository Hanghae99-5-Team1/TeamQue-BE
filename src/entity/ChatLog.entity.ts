import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class ChatLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  classId: number;

  @Column()
  writer: string;

  @Column()
  contents: string;

  @Column()
  uuid: string;

  @Column()
  type: number;

  @CreateDateColumn({ name: 'create_at' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'delete_at' })
  deletedAt?: Date | null;
}
