import { IsNumber } from 'class-validator';

export class ChatRoomDto {
  @IsNumber()
  classId: number;
}
