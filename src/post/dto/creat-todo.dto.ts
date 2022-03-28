import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTodoDto {
  @IsNotEmpty({ message: '할일을 입력해주세요' })
  @IsString({ message: '문자열을 입력해주세요' })
  content: string;
}
