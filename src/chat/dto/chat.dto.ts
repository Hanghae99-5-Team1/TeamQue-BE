import { IsNumber, IsString } from 'class-validator';

export class Chat {
  @IsNumber()
  classId: number;

  @IsString()
  content: string;
}
