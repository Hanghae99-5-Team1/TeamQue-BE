import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Chat } from 'src/entity/chat.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Like {
  @ApiProperty({ type: Number, description: 'like_id' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: Number, description: 'userId' })
  @Column()
  userId: number;

  @ApiProperty({ type: Number, description: 'classId' })
  @Column()
  classId: number;

  @ApiProperty({ type: String, description: 'uuid' })
  @Column()
  uuid: string;

  @ManyToOne(() => Chat, (chat) => chat.likes, { onDelete: 'CASCADE' })
  chat: Chat;
}
