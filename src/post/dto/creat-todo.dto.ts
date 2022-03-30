import { IsString } from 'class-validator';

export class CreateTodoDto {
  @IsString({ message: '할일을 입력해주세요' })
  content: string;
}
