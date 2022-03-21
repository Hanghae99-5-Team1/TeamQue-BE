import { IsNotEmpty } from 'class-validator';

export class CreateTodoDto {
  @IsNotEmpty({ message: '할일을 입력해주세요' })
  todo: string;
}
