import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Chat } from 'src/entity/chat.entity';

@Entity()
export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  classId: number;

  @Column()
  uuid: string;

  @ManyToOne(() => Chat, (chat) => chat.likes, { onDelete: 'CASCADE' })
  chat: Chat;
}
